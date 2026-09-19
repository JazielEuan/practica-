import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
  );

  // Permitir peticiones desde el frontend
  app.enableCors();

  // Puerto del backend
  const port =
    Number(process.env.PORT) || 3001;

  await app.listen(port);

  console.log(
    `🚀 Backend corriendo en http://localhost:${port}`,
  );
}

bootstrap();