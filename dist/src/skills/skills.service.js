"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SkillsService = class SkillsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSkillDto) {
        const existingSkill = await this.prisma.skill.findUnique({
            where: { name: createSkillDto.name },
        });
        if (existingSkill) {
            throw new common_1.ConflictException(`Skill with name "${createSkillDto.name}" already exists`);
        }
        const skill = await this.prisma.skill.create({
            data: {
                name: createSkillDto.name,
                description: createSkillDto.description,
                difficulty: createSkillDto.difficulty,
                category: createSkillDto.category,
            },
        });
        return skill;
    }
    async findAll() {
        const skills = await this.prisma.skill.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                prerequisites: {
                    include: {
                        prerequisite: {
                            select: {
                                id: true,
                                name: true,
                                difficulty: true,
                            },
                        },
                    },
                },
                dependents: {
                    include: {
                        skill: {
                            select: {
                                id: true,
                                name: true,
                                difficulty: true,
                            },
                        },
                    },
                },
            },
        });
        return skills;
    }
    async findOne(id) {
        const skill = await this.prisma.skill.findUnique({
            where: { id },
            include: {
                prerequisites: {
                    include: {
                        prerequisite: {
                            select: {
                                id: true,
                                name: true,
                                difficulty: true,
                                description: true,
                            },
                        },
                    },
                },
                dependents: {
                    include: {
                        skill: {
                            select: {
                                id: true,
                                name: true,
                                difficulty: true,
                                description: true,
                            },
                        },
                    },
                },
            },
        });
        if (!skill) {
            throw new common_1.NotFoundException(`Skill with ID "${id}" not found`);
        }
        return skill;
    }
    async update(id, updateSkillDto) {
        const existingSkill = await this.prisma.skill.findUnique({
            where: { id },
        });
        if (!existingSkill) {
            throw new common_1.NotFoundException(`Skill with ID "${id}" not found`);
        }
        if (updateSkillDto.name && updateSkillDto.name !== existingSkill.name) {
            const nameConflict = await this.prisma.skill.findUnique({
                where: { name: updateSkillDto.name },
            });
            if (nameConflict) {
                throw new common_1.ConflictException(`Skill with name "${updateSkillDto.name}" already exists`);
            }
        }
        const updatedSkill = await this.prisma.skill.update({
            where: { id },
            data: {
                name: updateSkillDto.name,
                description: updateSkillDto.description,
                difficulty: updateSkillDto.difficulty,
                category: updateSkillDto.category,
            },
        });
        return updatedSkill;
    }
    async remove(id) {
        const existingSkill = await this.prisma.skill.findUnique({
            where: { id },
        });
        if (!existingSkill) {
            throw new common_1.NotFoundException(`Skill with ID "${id}" not found`);
        }
        const [learningPathNodes, assessments] = await Promise.all([
            this.prisma.learningPathNode.findFirst({
                where: { skillId: id },
            }),
            this.prisma.assessment.findFirst({
                where: { skillId: id },
            }),
        ]);
        if (learningPathNodes || assessments) {
            throw new common_1.BadRequestException('Cannot delete skill that is being used in learning paths or assessments');
        }
        await this.prisma.skill.delete({
            where: { id },
        });
        return { message: 'Skill deleted successfully' };
    }
    async addPrerequisite(skillId, prerequisiteId) {
        if (skillId === prerequisiteId) {
            throw new common_1.BadRequestException('A skill cannot be a prerequisite of itself');
        }
        const [skill, prerequisite] = await Promise.all([
            this.prisma.skill.findUnique({ where: { id: skillId } }),
            this.prisma.skill.findUnique({ where: { id: prerequisiteId } }),
        ]);
        if (!skill) {
            throw new common_1.NotFoundException(`Skill with ID "${skillId}" not found`);
        }
        if (!prerequisite) {
            throw new common_1.NotFoundException(`Prerequisite skill with ID "${prerequisiteId}" not found`);
        }
        const existingPrerequisite = await this.prisma.skillPrerequisite.findUnique({
            where: {
                skillId_prerequisiteId: {
                    skillId,
                    prerequisiteId,
                },
            },
        });
        if (existingPrerequisite) {
            throw new common_1.ConflictException('Prerequisite relationship already exists');
        }
        const skillPrerequisite = await this.prisma.skillPrerequisite.create({
            data: {
                skillId,
                prerequisiteId,
            },
        });
        return skillPrerequisite;
    }
    async removePrerequisite(skillId, prerequisiteId) {
        const skillPrerequisite = await this.prisma.skillPrerequisite.findUnique({
            where: {
                skillId_prerequisiteId: {
                    skillId,
                    prerequisiteId,
                },
            },
        });
        if (!skillPrerequisite) {
            throw new common_1.NotFoundException('Prerequisite relationship not found');
        }
        await this.prisma.skillPrerequisite.delete({
            where: {
                skillId_prerequisiteId: {
                    skillId,
                    prerequisiteId,
                },
            },
        });
        return { message: 'Prerequisite removed successfully' };
    }
};
exports.SkillsService = SkillsService;
exports.SkillsService = SkillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SkillsService);
//# sourceMappingURL=skills.service.js.map