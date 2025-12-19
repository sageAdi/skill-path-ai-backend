export declare enum AssessmentType {
    ROLE_BASED = "ROLE_BASED",
    SKILL_BASED = "SKILL_BASED"
}
export declare class StartAssessmentDto {
    type: AssessmentType;
    skillId?: string;
}
