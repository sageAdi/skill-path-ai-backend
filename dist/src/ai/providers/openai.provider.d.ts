import { ConfigService } from '@nestjs/config';
import { IAIProvider, GeneratedQuestion, PathAdjustmentSuggestion } from '../interfaces/ai-provider.interface';
export declare class OpenAIProvider implements IAIProvider {
    private configService;
    private readonly logger;
    private readonly openai;
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
}
