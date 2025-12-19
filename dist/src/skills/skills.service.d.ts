import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
export declare class SkillsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSkillDto: CreateSkillDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        difficulty: import("@prisma/client").$Enums.SkillDifficulty;
        category: string | null;
    }>;
    findAll(): Promise<({
        prerequisites: ({
            prerequisite: {
                id: string;
                name: string;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            };
        } & {
            id: string;
            skillId: string;
            prerequisiteId: string;
        })[];
        dependents: ({
            skill: {
                id: string;
                name: string;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            };
        } & {
            id: string;
            skillId: string;
            prerequisiteId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        difficulty: import("@prisma/client").$Enums.SkillDifficulty;
        category: string | null;
    })[]>;
    findOne(id: string): Promise<{
        prerequisites: ({
            prerequisite: {
                id: string;
                name: string;
                description: string | null;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            };
        } & {
            id: string;
            skillId: string;
            prerequisiteId: string;
        })[];
        dependents: ({
            skill: {
                id: string;
                name: string;
                description: string | null;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            };
        } & {
            id: string;
            skillId: string;
            prerequisiteId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        difficulty: import("@prisma/client").$Enums.SkillDifficulty;
        category: string | null;
    }>;
    update(id: string, updateSkillDto: UpdateSkillDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        difficulty: import("@prisma/client").$Enums.SkillDifficulty;
        category: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addPrerequisite(skillId: string, prerequisiteId: string): Promise<{
        id: string;
        skillId: string;
        prerequisiteId: string;
    }>;
    removePrerequisite(skillId: string, prerequisiteId: string): Promise<{
        message: string;
    }>;
}
