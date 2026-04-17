import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Make PrismaService available app-wide without re-importing PrismaModule.
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
