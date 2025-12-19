import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { AIModule } from '../ai/ai.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [AIModule, ProgressModule],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
