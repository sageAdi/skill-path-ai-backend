import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CareerTransitionsResponseDto } from './dto/career-transitions.dto';
import { AIService } from '../ai/ai.service';
import type { CareerTransition } from '../ai/interfaces/ai-provider.interface';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        learningRole: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        learningRole: updateProfileDto.learningRole ?? user.learningRole,
        // Note: skillProfileMetadata could be added as a JSON field if needed
      },
      select: {
        id: true,
        email: true,
        role: true,
        learningRole: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Get 4 suggested career transitions based on current role
   * Uses AI (Groq) to generate personalized career transition suggestions
   */
  async getCareerTransitions(
    currentRole: string,
  ): Promise<CareerTransitionsResponseDto> {
    // Use AI to generate career transitions
    const suggestedRoles: CareerTransition[] =
      await this.aiService.suggestCareerTransitions(currentRole);

    return {
      currentRole,
      suggestedRoles,
    };
  }
}
