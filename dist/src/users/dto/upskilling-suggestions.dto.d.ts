import type { CareerTransition } from '../../ai/interfaces/ai-provider.interface';
export declare class UpskillingSuggestionsRequestDto {
    currentRole: string;
}
export declare class UpskillingSuggestionsResponseDto {
    currentRole: string;
    suggestedRoles: CareerTransition[];
}
