import type { IAIProvider } from './interfaces/ai-provider.interface';
import type { GeneratedQuestion, PathAdjustmentSuggestion } from './interfaces/ai-provider.interface';
export declare class AIService {
    private readonly aiProvider;
    constructor(aiProvider: IAIProvider);
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
