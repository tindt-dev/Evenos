import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/database/prisma/prisma.service';

type RegisterInput = {
  email: string;
  password: string;
  fullName?: string;
};

type AuthUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async buildAuthResponse(user: AuthUser) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user,
    };
  }

  async register(data: RegisterInput) {
    const email = data.email?.trim().toLowerCase();
    const password = data.password?.trim();
    const fullName = data.fullName?.trim() || null;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters.');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new BadRequestException('This email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });

    const authResponse = await this.buildAuthResponse({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    return {
      message: 'Account created successfully.',
      ...authResponse,
    };
  }

  async login(email: string, pass: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = pass?.trim();

    if (!normalizedEmail || !normalizedPassword) {
      throw new BadRequestException('Email and password are required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(normalizedPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  }
}
