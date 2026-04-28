import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip les champs non déclarés dans les DTOs
      forbidNonWhitelisted: true,
      transform: true,       // transforme les types automatiquement
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('api'); // toutes les routes sous /api/...

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
