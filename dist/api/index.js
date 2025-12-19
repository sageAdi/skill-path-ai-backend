"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const common_1 = require("@nestjs/common");
const app_module_1 = require("../src/app.module");
const express_1 = __importDefault(require("express"));
if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
}
let cachedApp = null;
let isInitializing = false;
let initError = null;
async function createApp() {
    if (cachedApp) {
        return cachedApp;
    }
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
        const expressApp = (0, express_1.default)();
        const adapter = new platform_express_1.ExpressAdapter(expressApp);
        const app = await core_1.NestFactory.create(app_module_1.AppModule, adapter, {
            logger: ['error', 'warn', 'log'],
        });
        app.enableCors({
            origin: true,
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        await app.init();
        console.log('NestJS application initialized successfully');
        cachedApp = expressApp;
        isInitializing = false;
        return expressApp;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error('Failed to create NestJS app:', {
            message: errorMessage,
            stack: errorStack,
            error: error,
        });
        initError = error instanceof Error ? error : new Error(String(error));
        isInitializing = false;
        throw initError;
    }
}
async function handler(req, res) {
    try {
        const app = await createApp();
        app(req, res);
    }
    catch (error) {
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
                message: process.env.NODE_ENV === 'production'
                    ? 'An error occurred while processing your request'
                    : errorMessage,
            });
        }
    }
}
//# sourceMappingURL=index.js.map