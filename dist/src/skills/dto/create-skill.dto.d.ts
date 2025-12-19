export declare enum SkillDifficulty {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED"
}
export declare class CreateSkillDto {
    name: string;
    description?: string;
    difficulty: SkillDifficulty;
    category?: string;
}
