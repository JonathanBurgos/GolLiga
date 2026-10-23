import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { ApiExceptionFilter } from './presentation/http/filters/api-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('FRONTEND_ORIGIN', 'http://localhost:4200').split(',').map((origin) => origin.trim()),
    credentials: true,
  });
  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api/v1'));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  app.useGlobalFilters(new ApiExceptionFilter());
  const swaggerConfig = new DocumentBuilder().setTitle('GolLiga API').setDescription('API de administración y competición de torneos de fútbol').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  const port = config.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`GolLiga API listening on http://localhost:${port}/${config.get('API_PREFIX', 'api/v1')}`);
}
void bootstrap();
