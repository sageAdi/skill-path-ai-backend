import { Module } from '@nestjs/common';
import { LearningPathController } from './learning-path.controller';
import { LearningPathService } from './learning-path.service';
import { AIModule } from '../ai/ai.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [AIModule, ProgressModule],
  controllers: [LearningPathController],
  providers: [LearningPathService],
  exports: [LearningPathService],
})
export class LearningPathModule {}
