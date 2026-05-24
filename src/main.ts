import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  // const PORT = configService.get<number>('PORT', 3000);
  const PORT = parseInt(configService.get<string>('PORT', '3000'), 10);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: configService.getOrThrow<string>('CORS_ORIGINS').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Swagger docs:
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MusicFlow API')
    .setDescription('REST API для музыкального стриминг сервиса MusicFlow')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Application is running on: \x1b[34m%s\x1b[0m`,
      `http://localhost:${PORT}/api/v1`,
    );
    console.log(
      `Swagger docs: \x1b[34m%s\x1b[0m`,
      `http://localhost:${PORT}/api/docs`,
    );
  });
}
void bootstrap();
