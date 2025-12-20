export interface QuestionOption {
    text: string;
    isCorrect: boolean;
}
export interface GeneratedQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
}
export interface PathAdjustmentSuggestion {
    action: 'INSERT_REVISION' | 'INSERT_MICRO_PRACTICE' | 'SKIP_SKILL' | 'REORDER';
    skillId?: string;
    targetOrder?: number;
    reason: string;
}
export interface CareerTransition {
    role: string;
    description: string;
    transitionDifficulty: 'Easy' | 'Medium' | 'Hard';
    commonSkills: string[];
}
export interface IAIProvider {
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
