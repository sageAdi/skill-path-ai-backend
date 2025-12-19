import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ProgressStatus } from '@prisma/client';

@Injectable()
export class ProgressService {
  private readonly MASTERY_THRESHOLD = 80; // Score >= 80% is considered mastery

  constructor(private prisma: PrismaService) {}

  async updateProgress(userId: string, updateProgressDto: UpdateProgressDto) {
    const { skillId, score } = updateProgressDto;

    // Verify skill exists
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // Get or create progress record
    let progress = await this.prisma.progress.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });

    const attempts = progress ? progress.attempts + 1 : 1;
    const status = this.determineStatus(score, attempts);

    if (progress) {
      // Update existing progress
      progress = await this.prisma.progress.update({
        where: {
          userId_skillId: {
            userId,
            skillId,
          },
        },
        data: {
          score,
          attempts,
          status,
          lastAttemptAt: new Date(),
        },
        include: {
          skill: true,
        },
      });
    } else {
      // Create new progress record
      progress = await this.prisma.progress.create({
        data: {
          userId,
          skillId,
          score,
          attempts,
          status,
          lastAttemptAt: new Date(),
        },
        include: {
          skill: true,
        },
      });
    }

    return progress;
  }

  async getProgressSummary(userId: string) {
    const progressRecords = await this.prisma.progress.findMany({
      where: { userId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            difficulty: true,
            category: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const summary = {
      totalSkills: progressRecords.length,
      completed: progressRecords.filter(
        (p) => p.status === ProgressStatus.COMPLETED,
      ).length,
      inProgress: progressRecords.filter(
        (p) => p.status === ProgressStatus.IN_PROGRESS,
      ).length,
      needsRevision: progressRecords.filter(
        (p) => p.status === ProgressStatus.NEEDS_REVISION,
      ).length,
      averageScore:
        progressRecords.length > 0
          ? progressRecords.reduce((sum, p) => sum + Number(p.score), 0) /
            progressRecords.length
          : 0,
      progress: progressRecords,
    };

    return summary;
  }

  async getProgressBySkill(userId: string, skillId: string) {
    const progress = await this.prisma.progress.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
      include: {
        skill: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('Progress not found for this skill');
    }

    return progress;
  }

  /**
   * Determine progress status based on score and attempts
   * Rule-based logic: Score >= 80% → COMPLETED, 50-79% → IN_PROGRESS or NEEDS_REVISION, < 50% → NEEDS_REVISION
   */
  private determineStatus(score: number, attempts: number): ProgressStatus {
    if (score >= this.MASTERY_THRESHOLD) {
      return ProgressStatus.COMPLETED;
    } else if (score >= 50) {
      // Between 50-79%: allow progression but flag for revision if multiple attempts
      return attempts > 2
        ? ProgressStatus.NEEDS_REVISION
        : ProgressStatus.IN_PROGRESS;
    } else {
      // Below 50%: needs revision
      return ProgressStatus.NEEDS_REVISION;
    }
  }

  /**
   * Get mastery threshold (used by learning path service)
   */
  getMasteryThreshold(): number {
    return this.MASTERY_THRESHOLD;
  }
}
