import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  learningRole?: string;

  @IsOptional()
  skillProfileMetadata?: Record<string, any>;
}
