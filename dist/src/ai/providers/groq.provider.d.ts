import { ConfigService } from '@nestjs/config';
import { IAIProvider, GeneratedQuestion, PathAdjustmentSuggestion, CareerTransition } from '../interfaces/ai-provider.interface';
export declare class GroqProvider implements IAIProvider {
    private configService;
    private readonly logger;
    private readonly groq;
    private readonly model;
    constructor(configService: ConfigService);
    generateQuestions(context: string, skillName?: string, count?: number): Promise<GeneratedQuestion[]>;
    explainAnswer(question: string, userAnswer: string, correctAnswer: string): Promise<string>;
    suggestPathAdjustments(progressData: Array<{
        skillId: string;
        skillName: string;
        score: number;
        attempts: number;
    }>, currentPath: Array<{
        skillId: string;
        skillName: string;
        order: number;
    }>): Promise<PathAdjustmentSuggestion[]>;
    suggestCareerTransitions(currentRole: string): Promise<CareerTransition[]>;
}
