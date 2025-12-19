import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
export declare class ProgressController {
    private readonly progressService;
    constructor(progressService: ProgressService);
    updateProgress(user: {
        id: string;
    }, updateProgressDto: UpdateProgressDto): Promise<{
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
    getProgressSummary(user: {
        id: string;
    }): Promise<{
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
    getProgressBySkill(user: {
        id: string;
    }, skillId: string): Promise<{
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
}
