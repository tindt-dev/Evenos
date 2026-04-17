import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, BookingStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

const DEFAULT_HOLD_MINUTES = 10;
const DEFAULT_MAX_TICKETS_PER_EVENT = 4;

function parsePositiveInt(value: unknown): number | null {
  const parsed =
    typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

function computeHoldExpiresAt(now: Date, holdMinutes: number) {
  return new Date(now.getTime() + holdMinutes * 60_000);
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private getHoldMinutes() {
    const parsed = parsePositiveInt(process.env.BOOKING_HOLD_MINUTES);
    return parsed ?? DEFAULT_HOLD_MINUTES;
  }

  private getMaxTicketsPerEvent() {
    const parsed = parsePositiveInt(process.env.MAX_TICKETS_PER_EVENT);
    return parsed ?? DEFAULT_MAX_TICKETS_PER_EVENT;
  }

  // If a booking is expired, release inventory and mark it EXPIRED.
  private async expireIfNeeded(bookingId: string, userId: string) {
    const now = new Date();
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ticketType: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }

    if (booking.status !== BookingStatus.PENDING) {
      return booking;
    }

    const holdMinutes = this.getHoldMinutes();
    const expiresAt = computeHoldExpiresAt(booking.createdAt, holdMinutes);

    if (now <= expiresAt) {
      return booking;
    }

    // Expired: restore inventory and mark booking.
    return this.prisma.$transaction(async (tx) => {
      const fresh = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!fresh) {
        throw new NotFoundException('Booking not found.');
      }
      if (fresh.userId !== userId) {
        throw new ForbiddenException('Access denied.');
      }
      if (fresh.status !== BookingStatus.PENDING) {
        return fresh;
      }

      await tx.ticketType.update({
        where: { id: fresh.ticketTypeId },
        data: { available: { increment: fresh.quantity } },
      });

      return tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.EXPIRED },
        include: { ticketType: true, event: true },
      });
    });
  }

  async createHold(params: {
    userId: string;
    eventId: string;
    ticketTypeId: string;
    quantity: number;
  }) {
    const { userId, eventId, ticketTypeId, quantity } = params;

    if (!eventId || !ticketTypeId) {
      throw new BadRequestException('eventId and ticketTypeId are required.');
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new BadRequestException('quantity must be a positive number.');
    }

    const now = new Date();
    const holdMinutes = this.getHoldMinutes();
    const maxPerEvent = this.getMaxTicketsPerEvent();

    return this.prisma.$transaction(async (tx) => {
      const ticketType = await tx.ticketType.findUnique({
        where: { id: ticketTypeId },
        include: { event: true },
      });

      if (!ticketType || ticketType.eventId !== eventId) {
        throw new NotFoundException('Ticket type not found for this event.');
      }

      if (!ticketType.event.isPublished) {
        throw new NotFoundException('Event not found.');
      }

      // Enforce per-user limit per event.
      const activeBookings = await tx.booking.findMany({
        where: {
          userId,
          eventId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        },
        select: { quantity: true, status: true, createdAt: true },
      });

      const activeQty = activeBookings.reduce((sum, booking) => {
        if (booking.status === BookingStatus.CONFIRMED) {
          return sum + booking.quantity;
        }

        // PENDING: only counts if still in hold window.
        const pendingExpiresAt = computeHoldExpiresAt(
          booking.createdAt,
          holdMinutes,
        );
        if (now <= pendingExpiresAt) {
          return sum + booking.quantity;
        }

        return sum;
      }, 0);

      if (activeQty + quantity > maxPerEvent) {
        throw new BadRequestException(
          `You can only buy up to ${maxPerEvent} tickets per event per account.`,
        );
      }

      if (ticketType.available < quantity) {
        throw new BadRequestException('Not enough tickets available.');
      }

      const totalPrice = new Prisma.Decimal(ticketType.price).mul(quantity);

      // Reserve inventory immediately (hold).
      await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: { available: { decrement: quantity } },
      });

      const booking = await tx.booking.create({
        data: {
          userId,
          eventId,
          ticketTypeId,
          quantity,
          totalPrice,
          status: BookingStatus.PENDING,
        },
        include: {
          event: {
            include: {
              creator: { select: { id: true, fullName: true, email: true } },
            },
          },
          ticketType: true,
        },
      });

      const holdExpiresAt = computeHoldExpiresAt(
        booking.createdAt,
        holdMinutes,
      );

      return {
        ...booking,
        holdExpiresAt,
      };
    });
  }

  async getBooking(params: { userId: string; bookingId: string }) {
    const { userId, bookingId } = params;
    const booking = await this.expireIfNeeded(bookingId, userId);

    // Ensure we return full details.
    const full = await this.prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        event: {
          include: {
            creator: { select: { id: true, fullName: true, email: true } },
          },
        },
        ticketType: true,
      },
    });

    if (!full) {
      throw new NotFoundException('Booking not found.');
    }

    const holdExpiresAt = computeHoldExpiresAt(
      full.createdAt,
      this.getHoldMinutes(),
    );
    return { ...full, holdExpiresAt };
  }

  async listMyBookings(userId: string) {
    const holdMinutes = this.getHoldMinutes();
    const now = new Date();

    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
            imageUrl: true,
          },
        },
        ticketType: { select: { id: true, name: true, price: true } },
      },
    });

    return bookings.map((booking) => ({
      ...booking,
      holdExpiresAt: computeHoldExpiresAt(booking.createdAt, holdMinutes),
      isExpired:
        booking.status === BookingStatus.PENDING &&
        now > computeHoldExpiresAt(booking.createdAt, holdMinutes),
    }));
  }

  async updateContact(params: {
    userId: string;
    bookingId: string;
    email: string;
    phone: string;
  }) {
    const { userId, bookingId, email, phone } = params;

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPhone = phone?.trim();

    if (!normalizedEmail) {
      throw new BadRequestException('Email is required.');
    }

    if (!normalizedPhone) {
      throw new BadRequestException('Phone number is required.');
    }

    const booking = await this.expireIfNeeded(bookingId, userId);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not editable.');
    }

    // If expired after we checked earlier, disallow.
    const now = new Date();
    if (now > computeHoldExpiresAt(booking.createdAt, this.getHoldMinutes())) {
      throw new BadRequestException('This booking has expired.');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        // These fields are added via Prisma migration.
        buyerEmail: normalizedEmail,
        buyerPhone: normalizedPhone,
      },
      include: {
        event: true,
        ticketType: true,
      },
    });
  }

  async pay(params: { userId: string; bookingId: string; method: string }) {
    const { userId, bookingId, method } = params;
    const normalizedMethod = method?.trim();

    if (!normalizedMethod) {
      throw new BadRequestException('Payment method is required.');
    }

    const booking = await this.expireIfNeeded(bookingId, userId);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not payable.');
    }

    const now = new Date();
    if (now > computeHoldExpiresAt(booking.createdAt, this.getHoldMinutes())) {
      throw new BadRequestException('This booking has expired.');
    }

    const qrCode = `EV-${bookingId}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
        qrCode,
        paidAt: now,
        paymentMethod: normalizedMethod,
      },
      include: {
        event: {
          include: {
            creator: { select: { id: true, fullName: true, email: true } },
          },
        },
        ticketType: true,
      },
    });
  }
}
