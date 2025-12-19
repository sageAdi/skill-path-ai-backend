import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OllamaProvider } from './providers/ollama.provider';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    {
      provide: 'AI_PROVIDER',
      useClass: OllamaProvider,
    },
  ],
  exports: [AIService, 'AI_PROVIDER'],
})
export class AIModule {}
