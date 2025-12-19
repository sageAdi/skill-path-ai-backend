export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare enum SkillDifficulty {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED"
}
export declare enum LearningPathStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    PAUSED = "PAUSED"
}
export declare enum NodeType {
    SKILL = "SKILL",
    REVISION = "REVISION",
    MICRO_PRACTICE = "MICRO_PRACTICE"
}
export declare enum NodeStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    SKIPPED = "SKIPPED"
}
export declare enum AssessmentType {
    ROLE_BASED = "ROLE_BASED",
    SKILL_BASED = "SKILL_BASED"
}
export declare enum AssessmentStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    ABANDONED = "ABANDONED"
}
export declare enum ProgressStatus {
    NOT_STARTED = "NOT_STARTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    NEEDS_REVISION = "NEEDS_REVISION"
}
export interface User {
    id: string;
    email: string;
    role: UserRole;
    learningRole?: string | null;
    createdAt: string;
    updatedAt?: string;
}
export interface RegisterDto {
    email: string;
    password: string;
    learningRole?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    access_token: string;
    user: User;
}
export interface Skill {
    id: string;
    name: string;
    description?: string | null;
    difficulty: SkillDifficulty;
    category?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface AssessmentQuestion {
    id: string;
    question: string;
    options: string[];
    order: number;
}
export interface Assessment {
    id: string;
    type: AssessmentType;
    status: AssessmentStatus;
    createdAt: string;
    completedAt?: string | null;
    questions: AssessmentQuestion[];
    skill?: Skill | null;
}
export interface AnswerDto {
    questionId: string;
    selectedAnswer: number;
}
export interface SubmitAssessmentDto {
    assessmentId: string;
    answers: AnswerDto[];
}
export interface AssessmentResult {
    assessmentId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    evaluatedAnswers: Array<{
        questionId: string;
        isCorrect: boolean;
        correctAnswer: number;
        userAnswer: number;
    }>;
}
export interface PathNode {
    id: string;
    skillId: string;
    skillName: string;
    order: number;
    nodeType: NodeType;
    status: NodeStatus;
    insertedAt: string;
}
export interface LearningPathResponse {
    id: string;
    userId: string;
    status: string;
    nodes: PathNode[];
    createdAt: string;
    updatedAt: string;
}
export interface Progress {
    id: string;
    userId: string;
    skillId: string;
    score: number;
    attempts: number;
    status: ProgressStatus;
    lastAttemptAt?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface UpdateProgressDto {
    skillId: string;
    score: number;
    assessmentId?: string;
}
export interface ProgressSummary {
    totalSkills: number;
    completed: number;
    inProgress: number;
    needsRevision: number;
    averageScore: number;
    progress: Progress[];
}
export interface ExplainAnswerDto {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
}
export interface AIExplanationResponse {
    explanation: string;
}
export interface ApiError {
    message: string;
    statusCode?: number;
    error?: string;
}
export declare class ApiErrorException extends Error implements ApiError {
    statusCode?: number;
    error?: string;
    constructor(apiError: ApiError);
}
