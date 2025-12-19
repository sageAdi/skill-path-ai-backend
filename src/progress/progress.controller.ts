import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('update')
  updateProgress(
    @CurrentUser() user: { id: string },
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.progressService.updateProgress(user.id, updateProgressDto);
  }

  @Get('summary')
  getProgressSummary(@CurrentUser() user: { id: string }) {
    return this.progressService.getProgressSummary(user.id);
  }

  @Get('skill/:skillId')
  getProgressBySkill(
    @CurrentUser() user: { id: string },
    @Param('skillId') skillId: string,
  ) {
    return this.progressService.getProgressBySkill(user.id, skillId);
  }
}
