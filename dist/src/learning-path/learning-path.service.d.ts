import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { AIService } from '../ai/ai.service';
import { LearningPathResponse } from './interfaces/path-node.interface';
import { GenerateRoadmapDto, GenerateRoadmapResponseDto } from './dto/generate-roadmap.dto';
export declare class LearningPathService {
    private prisma;
    private progressService;
    private aiService;
    constructor(prisma: PrismaService, progressService: ProgressService, aiService: AIService);
    getLearningPath(userId: string): Promise<LearningPathResponse>;
    generateInitialPath(userId: string): Promise<{
        nodes: ({
            skill: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
                category: string | null;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.NodeStatus;
            createdAt: Date;
            updatedAt: Date;
            order: number;
            nodeType: import("@prisma/client").$Enums.NodeType;
            insertedAt: Date;
            skillId: string;
            learningPathId: string;
        })[];
    } & {
        id: string;
        status: import("@prisma/client").$Enums.LearningPathStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    adaptPath(userId: string): Promise<LearningPathResponse>;
    private insertRevisionNode;
    private insertMicroPracticeNode;
    private shiftNodeOrders;
    private mapToResponse;
    generateRoadmap(userId: string, dto: GenerateRoadmapDto): Promise<GenerateRoadmapResponseDto>;
    private extractTopicFromQuestion;
}
