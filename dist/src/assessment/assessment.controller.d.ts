import { AssessmentService } from './assessment.service';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
export declare class AssessmentController {
    private readonly assessmentService;
    constructor(assessmentService: AssessmentService);
    startAssessment(user: {
        id: string;
    }, startAssessmentDto: StartAssessmentDto): Promise<{
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
    submitAssessment(user: {
        id: string;
    }, submitAssessmentDto: SubmitAssessmentDto): Promise<{
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
    getAssessment(user: {
        id: string;
    }, id: string): Promise<{
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
