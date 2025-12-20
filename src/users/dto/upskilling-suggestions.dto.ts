import { IsString, IsNotEmpty } from 'class-validator';
import type { CareerTransition } from '../../ai/interfaces/ai-provider.interface';

export class UpskillingSuggestionsRequestDto {
  @IsString()
  @IsNotEmpty()
  currentRole: string;
}

// Reuse the same format as career-transitions
export class UpskillingSuggestionsResponseDto {
  currentRole: string;
  suggestedRoles: CareerTransition[];
}
