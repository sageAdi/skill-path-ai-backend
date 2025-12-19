import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { ProgressService } from '../progress/progress.service';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
export declare class AssessmentService {
    private prisma;
    private aiService;
    private progressService;
    constructor(prisma: PrismaService, aiService: AIService, progressService: ProgressService);
    startAssessment(userId: string, startAssessmentDto: StartAssessmentDto): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.AssessmentType;
        status: import("@prisma/client").$Enums.AssessmentStatus;
        createdAt: Date;
        questions: {
            id: string;
            question: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            order: number;
        }[];
        skill: {
            name: string;
            id: string;
            description: string | null;
            difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            category: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
    submitAssessment(userId: string, submitAssessmentDto: SubmitAssessmentDto): Promise<{
        assessmentId: string;
        score: number;
        correctCount: number;
        totalQuestions: number;
        answers: {
            questionId: string;
            question: string;
            selectedAnswer: number;
            correctAnswer: number;
            isCorrect: boolean;
            explanation: string | null;
        }[];
    }>;
    getAssessment(assessmentId: string, userId: string): Promise<{
        skill: {
            name: string;
            id: string;
            description: string | null;
            difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            category: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        questions: {
            id: string;
            createdAt: Date;
            assessmentId: string;
            question: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            correctAnswer: number;
            explanation: string | null;
            order: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        skillId: string | null;
        userId: string;
        status: import("@prisma/client").$Enums.AssessmentStatus;
        type: import("@prisma/client").$Enums.AssessmentType;
        completedAt: Date | null;
    }>;
}
