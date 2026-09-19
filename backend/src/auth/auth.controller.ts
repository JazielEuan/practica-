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

interface JwtPayload {
  sub: string;
  email: string;
}

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
    // Verificar que exista el header Authorization
    if (!authHeader) {
      throw new UnauthorizedException(
        'Falta token',
      );
    }

    // Verificar que tenga formato Bearer TOKEN
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Formato de token inválido',
      );
    }

    // Extraer solamente el token
    const token = authHeader.substring(7);

    if (!token) {
      throw new UnauthorizedException(
        'Falta token',
      );
    }

    try {
      // Verificar y decodificar JWT
      const decoded =
        this.jwtService.verify<JwtPayload>(
          token,
        );

      // decoded.sub contiene user_id
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