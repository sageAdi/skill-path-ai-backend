import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class ExplainAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  userAnswer: string;

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('explain')
  async explainAnswer(@Body() dto: ExplainAnswerDto) {
    const explanation = await this.aiService.explainAnswer(
      dto.questionId, // This should be the question text, but for MVP we'll use questionId
      dto.userAnswer,
      dto.correctAnswer,
    );
    return { explanation };
  }
}
