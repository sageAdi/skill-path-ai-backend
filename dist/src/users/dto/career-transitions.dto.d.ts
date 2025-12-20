import type { CareerTransition } from '../../ai/interfaces/ai-provider.interface';
export declare class CareerTransitionsRequestDto {
    currentRole: string;
}
export declare class CareerTransitionsResponseDto {
    currentRole: string;
    suggestedRoles: CareerTransition[];
}
