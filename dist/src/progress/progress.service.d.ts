import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
export declare class ProgressService {
    private prisma;
    private readonly MASTERY_THRESHOLD;
    constructor(prisma: PrismaService);
    updateProgress(userId: string, updateProgressDto: UpdateProgressDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        skillId: string;
        score: import("@prisma/client-runtime-utils").Decimal;
        userId: string;
        attempts: number;
        status: import("@prisma/client").$Enums.ProgressStatus;
        lastAttemptAt: Date | null;
    }>;
    getProgressSummary(userId: string): Promise<{
        totalSkills: number;
        completed: number;
        inProgress: number;
        needsRevision: number;
        averageScore: number;
        progress: ({
            skill: {
                name: string;
                id: string;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
                category: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            skillId: string;
            score: import("@prisma/client-runtime-utils").Decimal;
            userId: string;
            attempts: number;
            status: import("@prisma/client").$Enums.ProgressStatus;
            lastAttemptAt: Date | null;
        })[];
    }>;
    getProgressBySkill(userId: string, skillId: string): Promise<{
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
        score: import("@prisma/client-runtime-utils").Decimal;
        userId: string;
        attempts: number;
        status: import("@prisma/client").$Enums.ProgressStatus;
        lastAttemptAt: Date | null;
    }>;
    private determineStatus;
    getMasteryThreshold(): number;
}
