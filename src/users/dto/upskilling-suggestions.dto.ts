import { IsString, IsNotEmpty } from 'class-validator';

export interface UpskillingSuggestion {
  skillName: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedWeeks: number;
  benefits: string[];
  resources: string[];
}

export class UpskillingSuggestionsRequestDto {
  @IsString()
  @IsNotEmpty()
  currentRole: string;
}

export interface UpskillingSuggestionsResponseDto {
  currentRole: string;
  suggestedSkills: UpskillingSuggestion[];
  recommendations: string;
}
