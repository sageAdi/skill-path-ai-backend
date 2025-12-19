import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { GroqProvider } from './providers/groq.provider';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    {
      provide: 'AI_PROVIDER',
      useClass: GroqProvider,
    },
  ],
  exports: [AIService, 'AI_PROVIDER'],
})
export class AIModule {}
