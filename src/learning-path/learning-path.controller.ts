import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LearningPathService } from './learning-path.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
}
