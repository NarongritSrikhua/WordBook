import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend with more permissive settings for development
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalPipes(new ValidationPipe());
  
  const port = 3001; // Explicitly set port to 3001
  console.log(`Server running on port ${port}`);
  await app.listen(port);
}
bootstrap();
