import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // LISTAR TODOS LOS USUARIOS
  // ==========================================
  async findAll() {
    return this.prisma.users.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        created_at: true,
        updated_at: true,

        user_statuses: {
          select: {
            name: true,
          },
        },

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

      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // ==========================================
  // BUSCAR USUARIO POR ID
  // ==========================================
  async findOne(userId: string) {
    const user =
      await this.prisma.users.findUnique({
        where: {
          user_id: userId,
        },

        select: {
          user_id: true,
          username: true,
          email: true,
          created_at: true,
          updated_at: true,

          user_statuses: {
            select: {
              name: true,
            },
          },

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
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    return user;
  }

  // ==========================================
  // CREAR USUARIO
  // ==========================================
  async create(
    createUserDto: CreateUserDto,
  ) {
    const username =
      createUserDto.username?.trim();

    const email =
      createUserDto.email
        ?.trim()
        .toLowerCase();

    const password =
      createUserDto.password;

    if (
      !username ||
      !email ||
      !password
    ) {
      throw new BadRequestException(
        'Nombre, correo y contraseña son obligatorios',
      );
    }

    // Verificar si ya existe el correo
    const existingUser =
      await this.prisma.users.findFirst({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con ese correo',
      );
    }

    // Buscar estado ACTIVE
    const activeStatus =
      await this.prisma.user_statuses.findFirst({
        where: {
          name: 'ACTIVE',
        },
      });

    if (!activeStatus) {
      throw new BadRequestException(
        'No existe el estado ACTIVE en la base de datos',
      );
    }

    // Cifrar contraseña
    const passwordHash =
      await bcrypt.hash(
        password,
        10,
      );

    // Crear usuario
    const newUser =
      await this.prisma.users.create({
        data: {
          username,
          email,
          password_hash:
            passwordHash,
          status_id:
            activeStatus.status_id,
        },

        select: {
          user_id: true,
          username: true,
          email: true,
          created_at: true,
          updated_at: true,

          user_statuses: {
            select: {
              name: true,
            },
          },
        },
      });

    return {
      message:
        'Usuario creado correctamente',

      user: newUser,
    };
  }

  // ==========================================
  // ACTUALIZAR USUARIO
  // ==========================================
  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ) {
    const user =
      await this.prisma.users.findUnique({
        where: {
          user_id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    const data: {
      username?: string;
      email?: string;
      password_hash?: string;
      updated_at?: Date;
    } = {};

    // Actualizar nombre
    if (
      updateUserDto.username !==
      undefined
    ) {
      const username =
        updateUserDto.username.trim();

      if (!username) {
        throw new BadRequestException(
          'El nombre no puede estar vacío',
        );
      }

      data.username = username;
    }

    // Actualizar correo
    if (
      updateUserDto.email !==
      undefined
    ) {
      const newEmail =
        updateUserDto.email
          .trim()
          .toLowerCase();

      if (!newEmail) {
        throw new BadRequestException(
          'El correo no puede estar vacío',
        );
      }

      const existingEmail =
        await this.prisma.users.findFirst({
          where: {
            email: newEmail,
          },
        });

      if (
        existingEmail &&
        existingEmail.user_id !==
          userId
      ) {
        throw new ConflictException(
          'Ya existe otro usuario con ese correo',
        );
      }

      data.email = newEmail;
    }

    // Actualizar contraseña
    if (
      updateUserDto.password !==
        undefined &&
      updateUserDto.password.trim()
    ) {
      data.password_hash =
        await bcrypt.hash(
          updateUserDto.password,
          10,
        );
    }

    data.updated_at = new Date();

    const updatedUser =
      await this.prisma.users.update({
        where: {
          user_id: userId,
        },

        data,

        select: {
          user_id: true,
          username: true,
          email: true,
          created_at: true,
          updated_at: true,

          user_statuses: {
            select: {
              name: true,
            },
          },

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

    return {
      message:
        'Usuario actualizado correctamente',

      user: updatedUser,
    };
  }

  // ==========================================
  // DESACTIVAR USUARIO
  // DELETE /users/:id
  // ==========================================
  async remove(
    userId: string,
    requesterId: string,
  ) {
    // Evitar que el SUPERUSUARIO
    // desactive su propia cuenta
    if (userId === requesterId) {
      throw new ForbiddenException(
        'No puedes desactivar tu propia cuenta de SUPERUSUARIO',
      );
    }

    // Comprobar que el usuario exista
    const user =
      await this.prisma.users.findUnique({
        where: {
          user_id: userId,
        },

        select: {
          user_id: true,
          username: true,
          email: true,
          status_id: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    // Buscar estado INACTIVE
    const inactiveStatus =
      await this.prisma.user_statuses.findFirst({
        where: {
          name: 'INACTIVE',
        },
      });

    if (!inactiveStatus) {
      throw new BadRequestException(
        'No existe el estado INACTIVE en la base de datos',
      );
    }

    // Verificar si ya está INACTIVE
    if (
      user.status_id ===
      inactiveStatus.status_id
    ) {
      throw new BadRequestException(
        'El usuario ya se encuentra desactivado',
      );
    }

    // Cambiar estado, NO borrar al usuario
    const updatedUser =
      await this.prisma.users.update({
        where: {
          user_id: userId,
        },

        data: {
          status_id:
            inactiveStatus.status_id,

          updated_at:
            new Date(),
        },

        select: {
          user_id: true,
          username: true,
          email: true,
          updated_at: true,

          user_statuses: {
            select: {
              name: true,
            },
          },
        },
      });

    return {
      message:
        'Usuario desactivado correctamente',

      user: updatedUser,
    };
  }
}