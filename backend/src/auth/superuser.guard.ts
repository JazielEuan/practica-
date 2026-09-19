import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service.js';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class SuperuserGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest();

    // Obtener Authorization
    const authHeader =
      request.headers.authorization;

    // Verificar que exista el token
    if (!authHeader) {
      throw new UnauthorizedException(
        'Falta token de autenticación',
      );
    }

    // Debe tener formato:
    // Bearer eyJ...
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Formato de token inválido',
      );
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new UnauthorizedException(
        'Falta token de autenticación',
      );
    }

    let decoded: JwtPayload;

    // Verificar JWT
    try {
      decoded =
        this.jwtService.verify<JwtPayload>(
          token,
        );
    } catch {
      throw new UnauthorizedException(
        'Token inválido o expirado',
      );
    }

    // Buscar usuario y sus roles
    const user =
      await this.prisma.users.findUnique({
        where: {
          user_id: decoded.sub,
        },

        select: {
          user_id: true,
          email: true,

          user_roles: {
            select: {
              roles: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no encontrado',
      );
    }

    // Comprobar SUPERUSUARIO
    const isSuperuser =
      user.user_roles.some(
        (userRole) =>
          userRole.roles.name
            ?.trim()
            .toUpperCase() ===
          'SUPERUSUARIO',
      );

    if (!isSuperuser) {
      throw new ForbiddenException(
        'No tienes permisos de SUPERUSUARIO',
      );
    }

    // Opcionalmente dejamos los datos
    // del usuario disponibles en la petición
    request.user = {
      user_id: user.user_id,
      email: user.email,
    };

    return true;
  }
}