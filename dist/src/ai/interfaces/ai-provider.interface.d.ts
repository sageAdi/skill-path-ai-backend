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
export interface RoadmapSkill {
    skillName: string;
    estimatedWeeks: number;
    priority: 'high' | 'medium' | 'low';
    resources: string[];
    milestones: string[];
    prerequisites?: string[];
}
export interface CareerRoadmap {
    targetRole: string;
    totalEstimatedWeeks: number;
    skills: RoadmapSkill[];
    recommendations: string;
}
export interface UpskillingSuggestion {
    skillName: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedWeeks: number;
    benefits: string[];
    resources: string[];
}
export interface UpskillingSuggestionsResponse {
    currentRole: string;
    suggestedSkills: UpskillingSuggestion[];
    recommendations: string;
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
    suggestUpskilling(currentRole: string): Promise<UpskillingSuggestionsResponse>;
}
