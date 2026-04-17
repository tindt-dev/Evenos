import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventsModule } from './modules/events/events.module';
import { BookingsModule } from './modules/bookings/bookings.module';

@Module({
  imports: [PrismaModule, AuthModule, EventsModule, BookingsModule],
})
export class AppModule {}
