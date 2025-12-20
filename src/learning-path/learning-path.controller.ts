import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { LearningPathService } from './learning-path.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  GenerateRoadmapDto,
  GenerateRoadmapResponseDto,
} from './dto/generate-roadmap.dto';

@Controller('learning-path')
@UseGuards(JwtAuthGuard)
export class LearningPathController {
  constructor(private readonly learningPathService: LearningPathService) {}

  @Get()
  getLearningPath(@CurrentUser() user: { id: string }) {
    return this.learningPathService.getLearningPath(user.id);
  }

  @Post('adapt')
  adaptPath(@CurrentUser() user: { id: string }) {
    return this.learningPathService.adaptPath(user.id);
  }

  @Post('generate-roadmap')
  generateRoadmap(
    @CurrentUser() user: { id: string },
    @Body() dto: GenerateRoadmapDto,
  ): Promise<GenerateRoadmapResponseDto> {
    return this.learningPathService.generateRoadmap(user.id, dto);
  }
}
