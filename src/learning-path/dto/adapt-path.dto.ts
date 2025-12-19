import { IsOptional, IsString } from 'class-validator';

export class AdaptPathDto {
  @IsOptional()
  @IsString()
  triggerReason?: string;
}
