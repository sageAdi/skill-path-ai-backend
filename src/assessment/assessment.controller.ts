import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
// import { IsUUID } from 'class-validator';

@Controller('assessment')
@UseGuards(JwtAuthGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('start')
  async startAssessment(
    @CurrentUser() user: { id: string },
    @Body() startAssessmentDto: StartAssessmentDto,
  ) {
    return this.assessmentService.startAssessment(user.id, startAssessmentDto);
  }

  @Post('submit')
  async submitAssessment(
    @CurrentUser() user: { id: string },
    @Body() submitAssessmentDto: SubmitAssessmentDto,
  ) {
    return this.assessmentService.submitAssessment(
      user.id,
      submitAssessmentDto,
    );
  }

  @Get(':id')
  async getAssessment(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.assessmentService.getAssessment(id, user.id);
  }
}
