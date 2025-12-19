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
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProgressService = class ProgressService {
    prisma;
    MASTERY_THRESHOLD = 80;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateProgress(userId, updateProgressDto) {
        const { skillId, score } = updateProgressDto;
        const skill = await this.prisma.skill.findUnique({
            where: { id: skillId },
        });
        if (!skill) {
            throw new common_1.NotFoundException('Skill not found');
        }
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
        }
        else {
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
    async getProgressSummary(userId) {
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
            completed: progressRecords.filter((p) => p.status === client_1.ProgressStatus.COMPLETED).length,
            inProgress: progressRecords.filter((p) => p.status === client_1.ProgressStatus.IN_PROGRESS).length,
            needsRevision: progressRecords.filter((p) => p.status === client_1.ProgressStatus.NEEDS_REVISION).length,
            averageScore: progressRecords.length > 0
                ? progressRecords.reduce((sum, p) => sum + Number(p.score), 0) /
                    progressRecords.length
                : 0,
            progress: progressRecords,
        };
        return summary;
    }
    async getProgressBySkill(userId, skillId) {
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
            throw new common_1.NotFoundException('Progress not found for this skill');
        }
        return progress;
    }
    determineStatus(score, attempts) {
        if (score >= this.MASTERY_THRESHOLD) {
            return client_1.ProgressStatus.COMPLETED;
        }
        else if (score >= 50) {
            return attempts > 2
                ? client_1.ProgressStatus.NEEDS_REVISION
                : client_1.ProgressStatus.IN_PROGRESS;
        }
        else {
            return client_1.ProgressStatus.NEEDS_REVISION;
        }
    }
    getMasteryThreshold() {
        return this.MASTERY_THRESHOLD;
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressService);
//# sourceMappingURL=progress.service.js.map