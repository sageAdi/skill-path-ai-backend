import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateRoadmapDto {
  @IsUUID()
  assessmentId: string;

  @IsString()
  @IsNotEmpty()
  targetRole: string;
}

export class RoadmapSkillNode {
  skillId: string;
  skillName: string;
  order: number;
  estimatedWeeks: number;
  priority: 'high' | 'medium' | 'low';
  resources: string[];
  milestones: string[];
}

export class GenerateRoadmapResponseDto {
  learningPathId: string;
  targetRole: string;
  totalEstimatedWeeks: number;
  nodes: RoadmapSkillNode[];
  recommendations: string;
  createdAt: Date;
}
