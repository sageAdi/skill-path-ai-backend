import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CareerTransitionsResponseDto } from './dto/career-transitions.dto';
import { UpskillingSuggestionsResponseDto } from './dto/upskilling-suggestions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Get('career-transitions')
  getCareerTransitions(
    @Query('currentRole') currentRole: string,
  ): Promise<CareerTransitionsResponseDto> {
    if (!currentRole || currentRole.trim() === '') {
      throw new BadRequestException('currentRole query parameter is required');
    }
    return this.usersService.getCareerTransitions(currentRole);
  }

  @Get('upskilling-suggestions')
  async getUpskillingSuggestions(
    @Query('currentRole') currentRole: string,
  ): Promise<UpskillingSuggestionsResponseDto> {
    if (!currentRole || currentRole.trim() === '') {
      throw new BadRequestException('currentRole query parameter is required');
    }
    return await this.usersService.getUpskillingSuggestions(currentRole);
  }
}
