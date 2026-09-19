import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service.js';

import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

import { SuperuserGuard } from '../auth/superuser.guard.js';

type AuthenticatedRequest = {
  user: {
    user_id: string;
    email: string;
  };
};

@Controller('users')
@UseGuards(SuperuserGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // ==========================================
  // LISTAR TODOS LOS USUARIOS
  // GET /users
  // ==========================================
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // ==========================================
  // BUSCAR USUARIO POR ID
  // GET /users/:id
  // ==========================================
  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.usersService.findOne(id);
  }

  // ==========================================
  // CREAR USUARIO
  // POST /users
  // ==========================================
  @Post()
  create(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(
      createUserDto,
    );
  }

  // ==========================================
  // ACTUALIZAR USUARIO
  // PATCH /users/:id
  // ==========================================
  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(
      id,
      updateUserDto,
    );
  }

  // ==========================================
  // ELIMINAR USUARIO
  // DELETE /users/:id
  // ==========================================
  @Delete(':id')
  remove(
    @Param('id')
    id: string,

    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.usersService.remove(
      id,
      request.user.user_id,
    );
  }
}