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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            category: string | null;
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            difficulty: import("@prisma/client").$Enums.SkillDifficulty;
            category: string | null;
        } | null;
        questions: {
            id: string;
            createdAt: Date;
            correctAnswer: number;
            question: string;
            options: import("@prisma/client/runtime/client").JsonValue;
            explanation: string | null;
            order: number;
            assessmentId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.AssessmentType;
        skillId: string | null;
        status: import("@prisma/client").$Enums.AssessmentStatus;
        completedAt: Date | null;
        userId: string;
    }>;
}
