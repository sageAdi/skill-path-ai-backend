export interface UpskillingSuggestion {
    skillName: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedWeeks: number;
    benefits: string[];
    resources: string[];
}
export declare class UpskillingSuggestionsRequestDto {
    currentRole: string;
}
export interface UpskillingSuggestionsResponseDto {
    currentRole: string;
    suggestedSkills: UpskillingSuggestion[];
    recommendations: string;
}
