import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { SuperuserGuard } from './superuser.guard.js';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'clave_secreta_super_segura_123',

      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],

  providers: [
    AuthService,
    SuperuserGuard,
  ],

  controllers: [
    AuthController,
  ],

  exports: [
    JwtModule,
    SuperuserGuard,
  ],
})
export class AuthModule {}