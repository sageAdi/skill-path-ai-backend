import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { ProgressService } from '../progress/progress.service';
import { StartAssessmentDto, AssessmentType } from './dto/start-assessment.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { AssessmentStatus, type Skill } from '@prisma/client';

@Injectable()
export class AssessmentService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private progressService: ProgressService,
  ) {}

  async startAssessment(
    userId: string,
    startAssessmentDto: StartAssessmentDto,
  ) {
    const { type, skillId } = startAssessmentDto;

    let skill: Skill | null = null;
    let context = '';

    if (type === AssessmentType.SKILL_BASED) {
      if (!skillId) {
        throw new BadRequestException(
          'skillId is required for skill-based assessment',
        );
      }

      skill = await this.prisma.skill.findUnique({
        where: { id: skillId },
      });

      if (!skill) {
        throw new NotFoundException('Skill not found');
      }

      context = skill.name;
    } else {
      // Role-based assessment
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { learningRole: true },
      });

      if (!user?.learningRole) {
        throw new BadRequestException(
          'User must have a learning role for role-based assessment',
        );
      }

      context = user.learningRole;
    }

    // Generate questions using AI
    const questions = await this.aiService.generateQuestions(
      context,
      skill?.name,
      5, // Default to 5 questions
    );

    if (questions.length === 0) {
      throw new Error('Failed to generate assessment questions');
    }

    // Create assessment record
    const assessment = await this.prisma.assessment.create({
      data: {
        userId,
        skillId: skill?.id || null,
        type,
        status: AssessmentStatus.IN_PROGRESS,
        questions: {
          create: questions.map((q, index) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswerIndex,
            explanation: q.explanation || null,
            order: index + 1,
          })),
        },
      },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        skill: true,
      },
    });

    // Return assessment without correct answers
    return {
      id: assessment.id,
      type: assessment.type,
      status: assessment.status,
      createdAt: assessment.createdAt,
      questions: assessment.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        order: q.order,
        // Don't expose correctAnswer or explanation until submission
      })),
      skill: assessment.skill,
    };
  }

  async submitAssessment(
    userId: string,
    submitAssessmentDto: SubmitAssessmentDto,
  ) {
    const { assessmentId, answers } = submitAssessmentDto;

    // Get assessment with questions
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        skill: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (assessment.userId !== userId) {
      throw new BadRequestException('Assessment does not belong to this user');
    }

    if (assessment.status === AssessmentStatus.COMPLETED) {
      throw new BadRequestException('Assessment already completed');
    }

    // Evaluate answers
    const evaluatedAnswers: Array<{
      questionId: string;
      question: string;
      selectedAnswer: number;
      correctAnswer: number;
      isCorrect: boolean;
      explanation: string | null;
    }> = [];
    let correctCount = 0;

    for (const answer of answers) {
      const question = assessment.questions.find(
        (q) => q.id === answer.questionId,
      );
      if (!question) {
        continue;
      }

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) {
        correctCount++;
      }

      // Save answer
      await this.prisma.assessmentAnswer.create({
        data: {
          questionId: answer.questionId,
          userId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
        },
      });

      evaluatedAnswers.push({
        questionId: answer.questionId,
        question: question.question,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      });
    }

    // Calculate score
    const totalQuestions = assessment.questions.length;
    const score =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // Update assessment status
    await this.prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: AssessmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Update progress if skill-based
    if (assessment.skillId) {
      await this.progressService.updateProgress(userId, {
        skillId: assessment.skillId,
        score,
        assessmentId,
      });
    }

    return {
      assessmentId,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      correctCount,
      totalQuestions,
      answers: evaluatedAnswers,
    };
  }

  async getAssessment(assessmentId: string, userId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        skill: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (assessment.userId !== userId) {
      throw new BadRequestException('Assessment does not belong to this user');
    }

    return assessment;
  }
}
