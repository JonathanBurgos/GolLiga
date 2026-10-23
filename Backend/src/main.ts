import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.useBodyParser('json', { limit: '2mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '2mb' });
  const config = app.get(ConfigService);
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('FRONTEND_ORIGIN', 'http://localhost:4200').split(',').map((origin) => origin.trim()),
    credentials: true,
  });
  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api/v1'));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  const swaggerConfig = new DocumentBuilder().setTitle('GolLiga API').setDescription('API de administración y competición de torneos de fútbol').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  const port = config.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  app.get(Logger).log(`GolLiga API listening on http://localhost:${port}/${config.get('API_PREFIX', 'api/v1')}`);
}
void bootstrap();
