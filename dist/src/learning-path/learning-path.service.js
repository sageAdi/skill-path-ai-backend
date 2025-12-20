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
exports.LearningPathService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const progress_service_1 = require("../progress/progress.service");
const ai_service_1 = require("../ai/ai.service");
const path_node_interface_1 = require("./interfaces/path-node.interface");
const client_1 = require("@prisma/client");
let LearningPathService = class LearningPathService {
    prisma;
    progressService;
    aiService;
    constructor(prisma, progressService, aiService) {
        this.prisma = prisma;
        this.progressService = progressService;
        this.aiService = aiService;
    }
    async getLearningPath(userId) {
        let learningPath = await this.prisma.learningPath.findFirst({
            where: {
                userId,
                status: client_1.LearningPathStatus.ACTIVE,
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
            learningPath = await this.generateInitialPath(userId);
        }
        return this.mapToResponse(learningPath);
    }
    async generateInitialPath(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { learningRole: true },
        });
        if (!user?.learningRole) {
            throw new common_1.BadRequestException('User must have a learning role to generate learning path');
        }
        const availableSkills = await this.prisma.skill.findMany({
            orderBy: {
                difficulty: 'asc',
            },
            take: 10,
        });
        if (availableSkills.length === 0) {
            throw new common_1.NotFoundException('No skills available for learning path generation');
        }
        const learningPath = await this.prisma.learningPath.create({
            data: {
                userId,
                status: client_1.LearningPathStatus.ACTIVE,
                nodes: {
                    create: availableSkills.map((skill, index) => ({
                        skillId: skill.id,
                        order: index + 1,
                        nodeType: path_node_interface_1.NodeType.SKILL,
                        status: client_1.NodeStatus.PENDING,
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
    async adaptPath(userId) {
        const learningPath = await this.prisma.learningPath.findFirst({
            where: {
                userId,
                status: client_1.LearningPathStatus.ACTIVE,
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
            throw new common_1.NotFoundException('No active learning path found');
        }
        const progressData = await this.prisma.progress.findMany({
            where: {
                userId,
                skillId: {
                    in: learningPath.nodes.map((n) => n.skillId),
                },
            },
        });
        const masteryThreshold = this.progressService.getMasteryThreshold();
        for (const node of learningPath.nodes) {
            const progress = progressData.find((p) => p.skillId === node.skillId);
            if (!progress) {
                continue;
            }
            const score = Number(progress.score);
            const attempts = progress.attempts;
            if (score >= masteryThreshold) {
                await this.prisma.learningPathNode.update({
                    where: { id: node.id },
                    data: { status: client_1.NodeStatus.COMPLETED },
                });
                continue;
            }
            if (score >= 50 && score < masteryThreshold) {
                if (node.status !== client_1.NodeStatus.COMPLETED) {
                    await this.prisma.learningPathNode.update({
                        where: { id: node.id },
                        data: { status: client_1.NodeStatus.IN_PROGRESS },
                    });
                }
                if (attempts > 2 && score < 70) {
                    await this.insertRevisionNode(learningPath.id, node, node.order + 1);
                }
            }
            if (score < 50) {
                await this.insertRevisionNode(learningPath.id, node, node.order + 1);
            }
            if (attempts >= 3 && score < 50) {
                await this.insertMicroPracticeNode(learningPath.id, node, node.order + 1);
            }
        }
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
        const aiSuggestions = await this.aiService.suggestPathAdjustments(progressForAI, currentPathForAI);
        console.log('AI Suggestions:', aiSuggestions);
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
        return this.mapToResponse(updatedPath);
    }
    async insertRevisionNode(learningPathId, targetNode, insertOrder) {
        const existingRevision = await this.prisma.learningPathNode.findFirst({
            where: {
                learningPathId,
                skillId: targetNode.skillId,
                nodeType: path_node_interface_1.NodeType.REVISION,
                status: {
                    not: client_1.NodeStatus.COMPLETED,
                },
            },
        });
        if (existingRevision) {
            return;
        }
        await this.shiftNodeOrders(learningPathId, insertOrder);
        await this.prisma.learningPathNode.create({
            data: {
                learningPathId,
                skillId: targetNode.skillId,
                order: insertOrder,
                nodeType: path_node_interface_1.NodeType.REVISION,
                status: client_1.NodeStatus.PENDING,
            },
        });
    }
    async insertMicroPracticeNode(learningPathId, targetNode, insertOrder) {
        const existingMicroPractice = await this.prisma.learningPathNode.findFirst({
            where: {
                learningPathId,
                skillId: targetNode.skillId,
                nodeType: path_node_interface_1.NodeType.MICRO_PRACTICE,
                status: {
                    not: client_1.NodeStatus.COMPLETED,
                },
            },
        });
        if (existingMicroPractice) {
            return;
        }
        await this.shiftNodeOrders(learningPathId, insertOrder);
        await this.prisma.learningPathNode.create({
            data: {
                learningPathId,
                skillId: targetNode.skillId,
                order: insertOrder,
                nodeType: path_node_interface_1.NodeType.MICRO_PRACTICE,
                status: client_1.NodeStatus.PENDING,
            },
        });
    }
    async shiftNodeOrders(learningPathId, fromOrder) {
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
    mapToResponse(learningPath) {
        return {
            id: learningPath.id,
            userId: learningPath.userId,
            status: learningPath.status,
            nodes: learningPath.nodes.map((node) => ({
                id: node.id,
                skillId: node.skillId,
                skillName: node.skill.name,
                order: node.order,
                nodeType: node.nodeType,
                status: node.status,
                insertedAt: node.insertedAt,
            })),
            createdAt: learningPath.createdAt,
            updatedAt: learningPath.updatedAt,
        };
    }
    async generateRoadmap(userId, dto) {
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
            throw new common_1.NotFoundException('Assessment not found');
        }
        if (assessment.userId !== userId) {
            throw new common_1.BadRequestException('Assessment does not belong to this user');
        }
        if (assessment.status !== client_1.AssessmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Assessment must be completed before generating a roadmap');
        }
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
            throw new common_1.BadRequestException('No answers found for this assessment');
        }
        const totalQuestions = assessment.questions.length;
        const correctAnswers = answers.filter((a) => a.isCorrect).length;
        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const weakAreas = [];
        const strengths = [];
        answers.forEach((answer) => {
            const questionText = answer.question.question;
            const topic = this.extractTopicFromQuestion(questionText);
            if (!answer.isCorrect && !weakAreas.includes(topic)) {
                weakAreas.push(topic);
            }
            else if (answer.isCorrect && !strengths.includes(topic)) {
                strengths.push(topic);
            }
        });
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
            throw new common_1.NotFoundException('No skills available for roadmap generation');
        }
        const aiRoadmap = await this.aiService.generateCareerRoadmap({
            score: Math.round(score * 100) / 100,
            totalQuestions,
            correctAnswers,
            weakAreas,
            strengths,
        }, dto.targetRole, availableSkills.map((s) => ({
            name: s.name,
            description: s.description || undefined,
            difficulty: s.difficulty,
        })));
        const roadmapNodes = [];
        let order = 1;
        const skillsToCreate = [];
        for (const aiSkill of aiRoadmap.skills) {
            const matchedSkill = availableSkills.find((s) => s.name.toLowerCase() === aiSkill.skillName.toLowerCase());
            if (!matchedSkill) {
                const difficulty = aiSkill.priority === 'high'
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
        if (skillsToCreate.length > 0) {
            console.log(`Creating ${skillsToCreate.length} missing skills in database:`, skillsToCreate.map((s) => s.name).join(', '));
            for (const skillData of skillsToCreate) {
                try {
                    const newSkill = await this.prisma.skill.create({
                        data: {
                            name: skillData.name,
                            difficulty: skillData.difficulty,
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
                }
                catch (error) {
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
                    }
                    else {
                        console.error(`Failed to create skill: ${skillData.name}`, error);
                    }
                }
            }
        }
        for (const aiSkill of aiRoadmap.skills) {
            const matchedSkill = availableSkills.find((s) => s.name.toLowerCase() === aiSkill.skillName.toLowerCase());
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
            }
            else {
                console.warn(`Skill "${aiSkill.skillName}" still not found after creation attempt`);
            }
        }
        if (roadmapNodes.length === 0) {
            throw new common_1.BadRequestException('Failed to create learning path. Please try again or contact support.');
        }
        const learningPath = await this.prisma.learningPath.create({
            data: {
                userId,
                status: client_1.LearningPathStatus.ACTIVE,
                nodes: {
                    create: roadmapNodes.map((node) => ({
                        skillId: node.skillId,
                        order: node.order,
                        nodeType: path_node_interface_1.NodeType.SKILL,
                        status: client_1.NodeStatus.PENDING,
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
        return {
            learningPathId: learningPath.id,
            targetRole: dto.targetRole,
            totalEstimatedWeeks: aiRoadmap.totalEstimatedWeeks,
            nodes: roadmapNodes,
            recommendations: aiRoadmap.recommendations,
            createdAt: learningPath.createdAt,
        };
    }
    extractTopicFromQuestion(question) {
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
        const words = question.split(' ').slice(0, 3);
        return words.join(' ');
    }
};
exports.LearningPathService = LearningPathService;
exports.LearningPathService = LearningPathService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        progress_service_1.ProgressService,
        ai_service_1.AIService])
], LearningPathService);
//# sourceMappingURL=learning-path.service.js.map