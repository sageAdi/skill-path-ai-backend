export declare class GenerateRoadmapDto {
    assessmentId: string;
    targetRole: string;
}
export declare class RoadmapSkillNode {
    skillId: string;
    skillName: string;
    order: number;
    estimatedWeeks: number;
    priority: 'high' | 'medium' | 'low';
    resources: string[];
    milestones: string[];
}
export declare class GenerateRoadmapResponseDto {
    learningPathId: string;
    targetRole: string;
    totalEstimatedWeeks: number;
    nodes: RoadmapSkillNode[];
    recommendations: string;
    createdAt: Date;
}
