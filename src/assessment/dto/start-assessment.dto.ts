import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum AssessmentType {
  ROLE_BASED = 'ROLE_BASED',
  SKILL_BASED = 'SKILL_BASED',
}

export class StartAssessmentDto {
  @IsEnum(AssessmentType)
  type: AssessmentType;

  @IsOptional()
  @IsUUID()
  skillId?: string;
}
