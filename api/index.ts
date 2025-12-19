import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import type { Request, Response } from 'express';
import express from 'express';

// Create a singleton NestJS app instance
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
let cachedApp: any = null;

async function createApp(): Promise<any> {
  if (cachedApp) {
    return cachedApp;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    logger: false, // Disable logger in serverless environment
  });

  // Enable CORS for frontend integration
  app.enableCors();

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  cachedApp = expressApp;
  return expressApp;
}

// Vercel serverless function handler
export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const app = await createApp();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app(req, res);
}
