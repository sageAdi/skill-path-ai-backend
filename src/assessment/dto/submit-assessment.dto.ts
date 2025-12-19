import {
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  // Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsUUID()
  questionId: string;

  @IsInt()
  @Min(0)
  selectedAnswer: number;
}

export class SubmitAssessmentDto {
  @IsUUID()
  assessmentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
