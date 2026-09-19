import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    // Buscar usuario por correo
    const user = await this.prisma.users.findFirst({
      where: {
        email,
      },
    });

    // Si el usuario no existe
    if (!user) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    // Verificar que exista el hash
    if (!user.password_hash) {
      console.log(
        'ERROR: El usuario no tiene password_hash',
      );

      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    // Verificar que la contraseña haya llegado
    if (!pass) {
      console.log(
        'ERROR: No se recibió la contraseña',
      );

      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    // Comparar contraseña con el hash guardado
    const isMatch = await bcrypt.compare(
      pass,
      user.password_hash,
    );

    // Si la contraseña no coincide
    if (!isMatch) {
      throw new UnauthorizedException(
        'Credenciales inválidas',
      );
    }

    // Información que se guardará dentro del JWT
    const payload = {
      sub: user.user_id,
      email: user.email,
    };

    // Respuesta del login
    return {
      access_token: this.jwtService.sign(payload),

      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async getProfile(userId: string) {
    return this.prisma.users.findUnique({
      where: {
        user_id: userId,
      },

      select: {
        user_id: true,
        username: true,
        email: true,
        created_at: true,
      },
    });
  }
}