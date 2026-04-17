import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/auth.types';
import { BookingsService } from './bookings.service';
import type { CreateBookingDto } from './dto/create-booking.dto';
import type { PayBookingDto } from './dto/pay-booking.dto';
import type { UpdateBookingContactDto } from './dto/update-booking-contact.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async listMine(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.bookingsService.listMyBookings(user.userId);
  }

  @Get(':id')
  async getOne(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.bookingsService.getBooking({
      userId: user.userId,
      bookingId: id,
    });
  }

  @Post()
  async createHold(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() body: CreateBookingDto,
  ) {
    return this.bookingsService.createHold({
      userId: user.userId,
      eventId: body.eventId,
      ticketTypeId: body.ticketTypeId,
      quantity: Number(body.quantity),
    });
  }

  @Patch(':id/contact')
  async updateContact(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() body: UpdateBookingContactDto,
  ) {
    return this.bookingsService.updateContact({
      userId: user.userId,
      bookingId: id,
      email: body.email,
      phone: body.phone,
    });
  }

  @Post(':id/pay')
  async pay(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() body: PayBookingDto,
  ) {
    return this.bookingsService.pay({
      userId: user.userId,
      bookingId: id,
      method: body.method,
    });
  }
}
