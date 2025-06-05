import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Log environment variables (excluding sensitive ones)
  logger.log('Environment configuration:');
  logger.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  logger.log(`SMTP_PORT: ${process.env.SMTP_PORT}`);
  logger.log(`SMTP_SECURE: ${process.env.SMTP_SECURE}`);
  logger.log(`SMTP_USER: ${process.env.SMTP_USER ? 'Set' : 'Not set'}`);
  logger.log(`SMTP_PASS: ${process.env.SMTP_PASS ? 'Set' : 'Not set'}`);
  logger.log(`SMTP_FROM: ${process.env.SMTP_FROM}`);
  logger.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with more permissive settings
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'], // Allow specific origins
    credentials: true, // Important for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  });
  
  app.useGlobalPipes(new ValidationPipe());
  
  const port = process.env.PORT || 3001;
  logger.log(`Server running on port ${port}`);
  await app.listen(port);
}
bootstrap();
