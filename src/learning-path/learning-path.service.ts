import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { AIService } from '../ai/ai.service';
import {
  LearningPathResponse,
  // PathNode,
} from './interfaces/path-node.interface';
import { NodeType, NodeStatus } from './interfaces/path-node.interface';
import {
  LearningPathStatus,
  NodeStatus as PrismaNodeStatus,
  AssessmentStatus,
  type Prisma,
  // NodeType as PrismaNodeType,
} from '@prisma/client';
import {
  GenerateRoadmapDto,
  GenerateRoadmapResponseDto,
  RoadmapSkillNode,
} from './dto/generate-roadmap.dto';

@Injectable()
export class LearningPathService {
  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
    private aiService: AIService,
  ) {}

  /**
   * Get or create learning path for user
   */
  async getLearningPath(userId: string): Promise<LearningPathResponse> {
    // Check if user has an active learning path
    let learningPath = await this.prisma.learningPath.findFirst({
      where: {
        userId,
        status: LearningPathStatus.ACTIVE,
      },
      include: {
        nodes: {
          include: {
            skill: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // If no active path exists, create one from assessment results
    if (!learningPath) {
      learningPath = await this.generateInitialPath(userId);
    }

    return this.mapToResponse(learningPath);
  }

  /**
   * Generate initial learning path based on assessment results
   * This creates a path from role-based assessment or available skills
   */
  async generateInitialPath(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { learningRole: true },
    });

    if (!user?.learningRole) {
      throw new BadRequestException(
        'User must have a learning role to generate learning path',
      );
    }

    // Get completed role-based assessments
    // const assessments = await this.prisma.assessment.findMany({
    //   where: {
    //     userId,
    //     type: 'ROLE_BASED',
    //     status: 'COMPLETED',
    //   },
    //   include: {
    //     questions: true,
    //   },
    //   orderBy: {
    //     completedAt: 'desc',
    //   },
    //   take: 1, // Get most recent
    // });

    // For MVP: Get all available skills (in production, this would be filtered by role/category)
    // In a real system, you'd have a skill catalog filtered by learning role
    const availableSkills = await this.prisma.skill.findMany({
      orderBy: {
        difficulty: 'asc',
      },
      take: 10, // Limit for MVP
    });

    if (availableSkills.length === 0) {
      throw new NotFoundException(
        'No skills available for learning path generation',
      );
    }

    // Create learning path
    const learningPath = await this.prisma.learningPath.create({
      data: {
        userId,
        status: LearningPathStatus.ACTIVE,
        nodes: {
          create: availableSkills.map((skill, index) => ({
            skillId: skill.id,
            order: index + 1,
            nodeType: NodeType.SKILL,
            status: PrismaNodeStatus.PENDING,
          })),
        },
      },
      include: {
        nodes: {
          include: {
            skill: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return learningPath;
  }

  /**
   * Adapt learning path based on progress data
   * Implements rule-based logic with AI suggestions
   */
  async adaptPath(userId: string) {
    const learningPath = await this.prisma.learningPath.findFirst({
      where: {
        userId,
        status: LearningPathStatus.ACTIVE,
      },
      include: {
        nodes: {
          include: {
            skill: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!learningPath) {
      throw new NotFoundException('No active learning path found');
    }

    // Get progress data for all skills in the path
    const progressData = await this.prisma.progress.findMany({
      where: {
        userId,
        skillId: {
          in: learningPath.nodes.map((n) => n.skillId),
        },
      },
    });

    const masteryThreshold = this.progressService.getMasteryThreshold();

    // Apply rule-based adaptation
    for (const node of learningPath.nodes) {
      const progress = progressData.find((p) => p.skillId === node.skillId);

      if (!progress) {
        continue; // No progress yet, skip
      }

      const score = Number(progress.score);
      const attempts = progress.attempts;

      // Rule 1: Score >= 80% → mark skill as completed
      if (score >= masteryThreshold) {
        await this.prisma.learningPathNode.update({
          where: { id: node.id },
          data: { status: PrismaNodeStatus.COMPLETED },
        });
        continue;
      }

      // Rule 2: Score 50-79% → allow progression but flag for revision
      if (score >= 50 && score < masteryThreshold) {
        // Update status to IN_PROGRESS if not already
        if (node.status !== PrismaNodeStatus.COMPLETED) {
          await this.prisma.learningPathNode.update({
            where: { id: node.id },
            data: { status: PrismaNodeStatus.IN_PROGRESS },
          });
        }

        // If multiple attempts, consider inserting revision node
        if (attempts > 2 && score < 70) {
          await this.insertRevisionNode(learningPath.id, node, node.order + 1);
        }
      }

      // Rule 3: Score < 50% → insert revision node before next skill
      if (score < 50) {
        await this.insertRevisionNode(learningPath.id, node, node.order + 1);
      }

      // Rule 4: Repeated failed attempts → insert micro-practice node
      if (attempts >= 3 && score < 50) {
        await this.insertMicroPracticeNode(
          learningPath.id,
          node,
          node.order + 1,
        );
      }
    }

    // Get AI suggestions (supports but doesn't override rules)
    const progressForAI = progressData.map((p) => {
      const node = learningPath.nodes.find((n) => n.skillId === p.skillId);
      return {
        skillId: p.skillId,
        skillName: node?.skill.name || 'Unknown',
        score: Number(p.score),
        attempts: p.attempts,
      };
    });

    const currentPathForAI = learningPath.nodes.map((n) => ({
      skillId: n.skillId,
      skillName: n.skill.name,
      order: n.order,
    }));

    const aiSuggestions = await this.aiService.suggestPathAdjustments(
      progressForAI,
      currentPathForAI,
    );

    // Apply AI suggestions that don't conflict with rules
    // For MVP, we'll log them but not auto-apply (can be enhanced later)
    console.log('AI Suggestions:', aiSuggestions);

    // Return updated path
    const updatedPath = await this.prisma.learningPath.findUnique({
      where: { id: learningPath.id },
      include: {
        nodes: {
          include: {
            skill: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return this.mapToResponse(updatedPath!);
  }

  /**
   * Insert a revision node for a skill
   */
  private async insertRevisionNode(
    learningPathId: string,
    targetNode: { id: string; skillId: string; order: number },
    insertOrder: number,
  ) {
    // Check if revision node already exists
    const existingRevision = await this.prisma.learningPathNode.findFirst({
      where: {
        learningPathId,
        skillId: targetNode.skillId,
        nodeType: NodeType.REVISION,
        status: {
          not: PrismaNodeStatus.COMPLETED,
        },
      },
    });

    if (existingRevision) {
      return; // Already has revision node
    }

    // Shift existing nodes
    await this.shiftNodeOrders(learningPathId, insertOrder);

    // Insert revision node
    await this.prisma.learningPathNode.create({
      data: {
        learningPathId,
        skillId: targetNode.skillId,
        order: insertOrder,
        nodeType: NodeType.REVISION,
        status: PrismaNodeStatus.PENDING,
      },
    });
  }

  /**
   * Insert a micro-practice node
   */
  private async insertMicroPracticeNode(
    learningPathId: string,
    targetNode: { id: string; skillId: string; order: number },
    insertOrder: number,
  ) {
    // Check if micro-practice node already exists
    const existingMicroPractice = await this.prisma.learningPathNode.findFirst({
      where: {
        learningPathId,
        skillId: targetNode.skillId,
        nodeType: NodeType.MICRO_PRACTICE,
        status: {
          not: PrismaNodeStatus.COMPLETED,
        },
      },
    });

    if (existingMicroPractice) {
      return; // Already has micro-practice node
    }

    // Shift existing nodes
    await this.shiftNodeOrders(learningPathId, insertOrder);

    // Insert micro-practice node
    await this.prisma.learningPathNode.create({
      data: {
        learningPathId,
        skillId: targetNode.skillId,
        order: insertOrder,
        nodeType: NodeType.MICRO_PRACTICE,
        status: PrismaNodeStatus.PENDING,
      },
    });
  }

  /**
   * Shift node orders to make room for insertion
   */
  private async shiftNodeOrders(learningPathId: string, fromOrder: number) {
    await this.prisma.learningPathNode.updateMany({
      where: {
        learningPathId,
        order: {
          gte: fromOrder,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Map Prisma learning path to response DTO
   */
  private mapToResponse(
    learningPath: Prisma.LearningPathGetPayload<{
      include: {
        nodes: {
          include: {
            skill: true;
          };
        };
      };
    }>,
  ): LearningPathResponse {
    return {
      id: learningPath.id,
      userId: learningPath.userId,
      status: learningPath.status,
      nodes: learningPath.nodes.map((node) => ({
        id: node.id,
        skillId: node.skillId,
        skillName: node.skill.name,
        order: node.order,
        nodeType: node.nodeType as NodeType,
        status: node.status as NodeStatus,
        insertedAt: node.insertedAt,
      })),
      createdAt: learningPath.createdAt,
      updatedAt: learningPath.updatedAt,
    };
  }

  /**
   * Generate comprehensive AI-powered roadmap based on assessment results
   */
  async generateRoadmap(
    userId: string,
    dto: GenerateRoadmapDto,
  ): Promise<GenerateRoadmapResponseDto> {
    // 1. Validate and fetch assessment
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: dto.assessmentId },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        user: true,
      },
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    if (assessment.userId !== userId) {
      throw new BadRequestException('Assessment does not belong to this user');
    }

    if (assessment.status !== AssessmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Assessment must be completed before generating a roadmap',
      );
    }

    // 2. Calculate assessment metrics
    const answers = await this.prisma.assessmentAnswer.findMany({
      where: {
        userId,
        questionId: {
          in: assessment.questions.map((q) => q.id),
        },
      },
      include: {
        question: true,
      },
    });

    if (answers.length === 0) {
      throw new BadRequestException('No answers found for this assessment');
    }

    const totalQuestions = assessment.questions.length;
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Identify weak areas (questions answered incorrectly)
    const weakAreas: string[] = [];
    const strengths: string[] = [];

    answers.forEach((answer) => {
      const questionText = answer.question.question;
      // Extract topic/skill from question (simplified - could be enhanced)
      const topic = this.extractTopicFromQuestion(questionText);

      if (!answer.isCorrect && !weakAreas.includes(topic)) {
        weakAreas.push(topic);
      } else if (answer.isCorrect && !strengths.includes(topic)) {
        strengths.push(topic);
      }
    });

    // 3. Fetch available skills
    const availableSkills = await this.prisma.skill.findMany({
      include: {
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
      orderBy: {
        difficulty: 'asc',
      },
    });

    if (availableSkills.length === 0) {
      throw new NotFoundException('No skills available for roadmap generation');
    }

    // 4. Call AI to generate roadmap
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const aiRoadmap = await this.aiService.generateCareerRoadmap(
      {
        score: Math.round(score * 100) / 100,
        totalQuestions,
        correctAnswers,
        weakAreas,
        strengths,
      },
      dto.targetRole,
      availableSkills.map((s) => ({
        name: s.name,
        description: s.description || undefined,
        difficulty: s.difficulty,
      })),
    );

    // 5. Match AI suggestions to actual skill IDs (create missing skills)
    const roadmapNodes: RoadmapSkillNode[] = [];
    let order = 1;
    const skillsToCreate: Array<{ name: string; difficulty: string }> = [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const aiSkill of aiRoadmap.skills as Array<{
      skillName: string;
      estimatedWeeks: number;
      priority: 'high' | 'medium' | 'low';
      resources: string[];
      milestones: string[];
    }>) {
      // Find matching skill in database (case-insensitive)
      const matchedSkill = availableSkills.find(
        (s) => s.name.toLowerCase() === aiSkill.skillName.toLowerCase(),
      );

      // If skill doesn't exist, prepare to create it
      if (!matchedSkill) {
        // Determine difficulty based on priority
        const difficulty =
          aiSkill.priority === 'high'
            ? 'BEGINNER'
            : aiSkill.priority === 'low'
              ? 'ADVANCED'
              : 'INTERMEDIATE';

        skillsToCreate.push({
          name: aiSkill.skillName,
          difficulty,
        });
      }
    }

    // Create missing skills in database
    if (skillsToCreate.length > 0) {
      console.log(
        `Creating ${skillsToCreate.length} missing skills in database:`,
        skillsToCreate.map((s) => s.name).join(', '),
      );

      for (const skillData of skillsToCreate) {
        try {
          const newSkill = await this.prisma.skill.create({
            data: {
              name: skillData.name,
              difficulty: skillData.difficulty as
                | 'BEGINNER'
                | 'INTERMEDIATE'
                | 'ADVANCED',
              description: `AI-suggested skill for ${dto.targetRole}`,
            },
            include: {
              prerequisites: {
                include: {
                  prerequisite: true,
                },
              },
            },
          });
          availableSkills.push(newSkill);
        } catch (error) {
          // Skill might have been created concurrently, try to fetch it
          const existingSkill = await this.prisma.skill.findUnique({
            where: { name: skillData.name },
            include: {
              prerequisites: {
                include: {
                  prerequisite: true,
                },
              },
            },
          });
          if (existingSkill) {
            availableSkills.push(existingSkill);
          } else {
            console.error(`Failed to create skill: ${skillData.name}`, error);
          }
        }
      }
    }

    // Now match again with the updated skill list
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const aiSkill of aiRoadmap.skills as Array<{
      skillName: string;
      estimatedWeeks: number;
      priority: 'high' | 'medium' | 'low';
      resources: string[];
      milestones: string[];
    }>) {
      // Find matching skill in database (case-insensitive)
      const matchedSkill = availableSkills.find(
        (s) => s.name.toLowerCase() === aiSkill.skillName.toLowerCase(),
      );

      if (matchedSkill) {
        roadmapNodes.push({
          skillId: matchedSkill.id,
          skillName: matchedSkill.name,
          order: order++,
          estimatedWeeks: aiSkill.estimatedWeeks,
          priority: aiSkill.priority,
          resources: aiSkill.resources,
          milestones: aiSkill.milestones,
        });
      } else {
        // This should rarely happen after creating missing skills
        console.warn(
          `Skill "${aiSkill.skillName}" still not found after creation attempt`,
        );
      }
    }

    if (roadmapNodes.length === 0) {
      throw new BadRequestException(
        'Failed to create learning path. Please try again or contact support.',
      );
    }

    // 6. Create LearningPath in database
    const learningPath = await this.prisma.learningPath.create({
      data: {
        userId,
        status: LearningPathStatus.ACTIVE,
        nodes: {
          create: roadmapNodes.map((node) => ({
            skillId: node.skillId,
            order: node.order,
            nodeType: NodeType.SKILL,
            status: PrismaNodeStatus.PENDING,
          })),
        },
      },
      include: {
        nodes: {
          include: {
            skill: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // 7. Build response with enriched data
    return {
      learningPathId: learningPath.id,
      targetRole: dto.targetRole,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      totalEstimatedWeeks: aiRoadmap.totalEstimatedWeeks,
      nodes: roadmapNodes,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      recommendations: aiRoadmap.recommendations,
      createdAt: learningPath.createdAt,
    };
  }

  /**
   * Helper: Extract topic from question text
   * Simplified implementation - could be enhanced with NLP
   */
  private extractTopicFromQuestion(question: string): string {
    // Simple keyword extraction (could be improved)
    const keywords = [
      'JavaScript',
      'TypeScript',
      'React',
      'Node.js',
      'API',
      'Database',
      'SQL',
      'NoSQL',
      'Docker',
      'Git',
      'Testing',
      'Security',
      'Performance',
      'CSS',
      'HTML',
    ];

    for (const keyword of keywords) {
      if (question.toLowerCase().includes(keyword.toLowerCase())) {
        return keyword;
      }
    }

    // Extract first few words as fallback
    const words = question.split(' ').slice(0, 3);
    return words.join(' ');
  }
}
