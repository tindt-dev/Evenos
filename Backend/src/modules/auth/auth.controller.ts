import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

type RegisterBody = {
  email: string;
  password: string;
  fullName?: string;
};

type LoginBody = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterBody) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginBody) {
    return this.authService.login(body.email, body.password);
  }
}
