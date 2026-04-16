import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Để dùng Prisma ở mọi nơi mà không cần import lại PrismaModule
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule { }