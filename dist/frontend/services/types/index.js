export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (UserRole = {}));
export var SkillDifficulty;
(function (SkillDifficulty) {
    SkillDifficulty["BEGINNER"] = "BEGINNER";
    SkillDifficulty["INTERMEDIATE"] = "INTERMEDIATE";
    SkillDifficulty["ADVANCED"] = "ADVANCED";
})(SkillDifficulty || (SkillDifficulty = {}));
export var LearningPathStatus;
(function (LearningPathStatus) {
    LearningPathStatus["ACTIVE"] = "ACTIVE";
    LearningPathStatus["COMPLETED"] = "COMPLETED";
    LearningPathStatus["PAUSED"] = "PAUSED";
})(LearningPathStatus || (LearningPathStatus = {}));
export var NodeType;
(function (NodeType) {
    NodeType["SKILL"] = "SKILL";
    NodeType["REVISION"] = "REVISION";
    NodeType["MICRO_PRACTICE"] = "MICRO_PRACTICE";
})(NodeType || (NodeType = {}));
export var NodeStatus;
(function (NodeStatus) {
    NodeStatus["PENDING"] = "PENDING";
    NodeStatus["IN_PROGRESS"] = "IN_PROGRESS";
    NodeStatus["COMPLETED"] = "COMPLETED";
    NodeStatus["SKIPPED"] = "SKIPPED";
})(NodeStatus || (NodeStatus = {}));
export var AssessmentType;
(function (AssessmentType) {
    AssessmentType["ROLE_BASED"] = "ROLE_BASED";
    AssessmentType["SKILL_BASED"] = "SKILL_BASED";
})(AssessmentType || (AssessmentType = {}));
export var AssessmentStatus;
(function (AssessmentStatus) {
    AssessmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AssessmentStatus["COMPLETED"] = "COMPLETED";
    AssessmentStatus["ABANDONED"] = "ABANDONED";
})(AssessmentStatus || (AssessmentStatus = {}));
export var ProgressStatus;
(function (ProgressStatus) {
    ProgressStatus["NOT_STARTED"] = "NOT_STARTED";
    ProgressStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProgressStatus["COMPLETED"] = "COMPLETED";
    ProgressStatus["NEEDS_REVISION"] = "NEEDS_REVISION";
})(ProgressStatus || (ProgressStatus = {}));
export class ApiErrorException extends Error {
    statusCode;
    error;
    constructor(apiError) {
        super(apiError.message);
        this.name = 'ApiErrorException';
        this.statusCode = apiError.statusCode;
        this.error = apiError.error;
        Object.setPrototypeOf(this, ApiErrorException.prototype);
    }
}
//# sourceMappingURL=index.js.map