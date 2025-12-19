import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { AIService } from '../ai/ai.service';
import { LearningPathResponse } from './interfaces/path-node.interface';
export declare class LearningPathService {
    private prisma;
    private progressService;
    private aiService;
    constructor(prisma: PrismaService, progressService: ProgressService, aiService: AIService);
    getLearningPath(userId: string): Promise<LearningPathResponse>;
    generateInitialPath(userId: string): Promise<{
        nodes: ({
            skill: {
                name: string;
                id: string;
                description: string | null;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
                category: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            skillId: string;
            status: import("@prisma/client").$Enums.NodeStatus;
            order: number;
            nodeType: import("@prisma/client").$Enums.NodeType;
            insertedAt: Date;
            learningPathId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.LearningPathStatus;
    }>;
    adaptPath(userId: string): Promise<LearningPathResponse>;
    private insertRevisionNode;
    private insertMicroPracticeNode;
    private shiftNodeOrders;
    private mapToResponse;
}
