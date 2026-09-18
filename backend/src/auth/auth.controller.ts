import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(
    @Body()
    body: {
      email: string;
      pass: string;
    },
  ) {
    return this.authService.login(
      body.email,
      body.pass,
    );
  }

  @Get('me')
  async getMe(
    @Headers('authorization')
    authHeader: string,
  ) {
    if (!authHeader) {
      throw new UnauthorizedException(
        'Falta token',
      );
    }

    const token = authHeader.replace(
      'Bearer ',
      '',
    );

    try {
      const decoded =
        this.jwtService.verify(token);

      return this.authService.getProfile(
        decoded.sub,
      );
    } catch {
      throw new UnauthorizedException(
        'Token inválido o expirado',
      );
    }
  }
}