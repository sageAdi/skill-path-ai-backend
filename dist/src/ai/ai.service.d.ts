import type { IAIProvider } from './interfaces/ai-provider.interface';
import type { GeneratedQuestion, PathAdjustmentSuggestion, CareerTransition, CareerRoadmap } from './interfaces/ai-provider.interface';
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
    suggestCareerTransitions(currentRole: string): Promise<CareerTransition[]>;
    generateCareerRoadmap(assessmentData: {
        score: number;
        totalQuestions: number;
        correctAnswers: number;
        weakAreas: string[];
        strengths: string[];
    }, targetRole: string, availableSkills: Array<{
        name: string;
        description?: string;
        difficulty: string;
    }>): Promise<CareerRoadmap>;
    suggestUpskilling(currentRole: string): Promise<CareerTransition[]>;
}
