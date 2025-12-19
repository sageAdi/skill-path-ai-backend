import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
export declare class SkillsController {
    private readonly skillsService;
    constructor(skillsService: SkillsService);
    create(createSkillDto: CreateSkillDto): Promise<{
        name: string;
        id: string;
        description: string | null;
        difficulty: import("@prisma/client").$Enums.SkillDifficulty;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        prerequisites: ({
            prerequisite: {
                name: string;
                id: string;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            };
        } & {
            id: string;
            skillId: string;
            prerequisiteId: string;
        })[];
        dependents: ({
            skill: {
                name: string;
                id: string;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            };
        } & {
            id: string;
            skillId: string;
            prerequisiteId: string;
        })[];
    } & {
        name: string;
        id: string;
        description: string | null;
        difficulty: import("@prisma/client").$Enums.SkillDifficulty;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        prerequisites: ({
            prerequisite: {
                name: string;
                id: string;
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
                name: string;
                id: string;
                description: string | null;
                difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            };
        } & {
            id: string;
            skillId: string;
            prerequisiteId: string;
        })[];
    } & {
        name: string;
        id: string;
        description: string | null;
        difficulty: import("@prisma/client").$Enums.SkillDifficulty;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateSkillDto: UpdateSkillDto): Promise<{
        name: string;
        id: string;
        description: string | null;
        difficulty: import("@prisma/client").$Enums.SkillDifficulty;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addPrerequisite(id: string, prerequisiteId: string): Promise<{
        id: string;
        skillId: string;
        prerequisiteId: string;
    }>;
    removePrerequisite(id: string, prerequisiteId: string): Promise<{
        message: string;
    }>;
}
