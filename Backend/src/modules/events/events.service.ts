import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished() {
    const events = await this.prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { startDate: 'asc' },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true },
        },
        ticketTypes: {
          orderBy: { price: 'asc' },
          select: {
            id: true,
            name: true,
            price: true,
            available: true,
          },
        },
      },
    });

    return events;
  }

  async getPublishedById(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, isPublished: true },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true },
        },
        ticketTypes: {
          orderBy: { price: 'asc' },
          select: {
            id: true,
            name: true,
            price: true,
            available: true,
            capacity: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found.');
    }

    return event;
  }
}
