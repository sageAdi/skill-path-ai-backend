import { IsUUID, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class UpdateProgressDto {
  @IsUUID()
  skillId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsOptional()
  @IsUUID()
  assessmentId?: string;
}
