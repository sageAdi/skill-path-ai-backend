import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import type { Request, Response } from 'express';
import express from 'express';

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
}

// Create a singleton NestJS app instance
let cachedApp: express.Application | null = null;
let isInitializing = false;
let initError: Error | null = null;

async function createApp(): Promise<express.Application> {
  // Return cached app if available
  if (cachedApp) {
    return cachedApp;
  }

  // If already initializing, wait a bit and retry
  if (isInitializing) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (cachedApp) {
      return cachedApp;
    }
    if (initError) {
      throw initError;
    }
  }

  isInitializing = true;
  initError = null;

  try {
    console.log('Initializing NestJS application...');

    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);

    const app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn', 'log'], // Include log level for debugging
    });

    // Enable CORS for frontend integration
    app.enableCors({
      origin: true, // Allow all origins in serverless
      credentials: true,
    });

    // Global validation pipe for DTOs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    console.log('NestJS application initialized successfully');

    cachedApp = expressApp;
    isInitializing = false;
    return expressApp;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Failed to create NestJS app:', {
      message: errorMessage,
      stack: errorStack,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      error: error,
    });

    initError = error instanceof Error ? error : new Error(String(error));
    isInitializing = false;
    throw initError;
  }
}

// Vercel serverless function handler
export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const app = await createApp();
    app(req, res);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Handler error:', {
      message: errorMessage,
      stack: errorStack,
      url: req.url,
      method: req.method,
    });

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An error occurred while processing your request'
            : errorMessage,
      });
    }
  }
}
