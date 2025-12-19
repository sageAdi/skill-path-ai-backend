import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { SkillDifficulty } from './create-skill.dto';

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(SkillDifficulty)
  difficulty?: SkillDifficulty;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;
}
