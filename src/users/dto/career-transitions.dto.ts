import { IsString, IsNotEmpty } from 'class-validator';
import type { CareerTransition } from '../../ai/interfaces/ai-provider.interface';

export class CareerTransitionsRequestDto {
  @IsString()
  @IsNotEmpty()
  currentRole: string;
}

export class CareerTransitionsResponseDto {
  currentRole: string;
  suggestedRoles: CareerTransition[];
}
