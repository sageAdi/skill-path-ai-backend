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
exports.AssessmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const progress_service_1 = require("../progress/progress.service");
const start_assessment_dto_1 = require("./dto/start-assessment.dto");
const client_1 = require("@prisma/client");
let AssessmentService = class AssessmentService {
    prisma;
    aiService;
    progressService;
    constructor(prisma, aiService, progressService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.progressService = progressService;
    }
    async startAssessment(userId, startAssessmentDto) {
        const { type, skillId } = startAssessmentDto;
        let skill = null;
        let context = '';
        if (type === start_assessment_dto_1.AssessmentType.SKILL_BASED) {
            if (!skillId) {
                throw new common_1.BadRequestException('skillId is required for skill-based assessment');
            }
            skill = await this.prisma.skill.findUnique({
                where: { id: skillId },
            });
            if (!skill) {
                throw new common_1.NotFoundException('Skill not found');
            }
            context = skill.name;
        }
        else {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { learningRole: true },
            });
            if (!user?.learningRole) {
                throw new common_1.BadRequestException('User must have a learning role for role-based assessment');
            }
            context = user.learningRole;
        }
        const questions = await this.aiService.generateQuestions(context, skill?.name, 5);
        if (questions.length === 0) {
            throw new Error('Failed to generate assessment questions');
        }
        const assessment = await this.prisma.assessment.create({
            data: {
                userId,
                skillId: skill?.id || null,
                type,
                status: client_1.AssessmentStatus.IN_PROGRESS,
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
            })),
            skill: assessment.skill,
        };
    }
    async submitAssessment(userId, submitAssessmentDto) {
        const { assessmentId, answers } = submitAssessmentDto;
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
            throw new common_1.NotFoundException('Assessment not found');
        }
        if (assessment.userId !== userId) {
            throw new common_1.BadRequestException('Assessment does not belong to this user');
        }
        if (assessment.status === client_1.AssessmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Assessment already completed');
        }
        const evaluatedAnswers = [];
        let correctCount = 0;
        for (const answer of answers) {
            const question = assessment.questions.find((q) => q.id === answer.questionId);
            if (!question) {
                continue;
            }
            const isCorrect = answer.selectedAnswer === question.correctAnswer;
            if (isCorrect) {
                correctCount++;
            }
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
        const totalQuestions = assessment.questions.length;
        const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
        await this.prisma.assessment.update({
            where: { id: assessmentId },
            data: {
                status: client_1.AssessmentStatus.COMPLETED,
                completedAt: new Date(),
            },
        });
        if (assessment.skillId) {
            await this.progressService.updateProgress(userId, {
                skillId: assessment.skillId,
                score,
                assessmentId,
            });
        }
        return {
            assessmentId,
            score: Math.round(score * 100) / 100,
            correctCount,
            totalQuestions,
            answers: evaluatedAnswers,
        };
    }
    async getAssessment(assessmentId, userId) {
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
            throw new common_1.NotFoundException('Assessment not found');
        }
        if (assessment.userId !== userId) {
            throw new common_1.BadRequestException('Assessment does not belong to this user');
        }
        return assessment;
    }
};
exports.AssessmentService = AssessmentService;
exports.AssessmentService = AssessmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService,
        progress_service_1.ProgressService])
], AssessmentService);
//# sourceMappingURL=assessment.service.js.map