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
export interface PathNode {
    id: string;
    skillId: string;
    skillName: string;
    order: number;
    nodeType: NodeType;
    status: NodeStatus;
    insertedAt: Date;
}
export interface LearningPathResponse {
    id: string;
    userId: string;
    status: string;
    nodes: PathNode[];
    createdAt: Date;
    updatedAt: Date;
}
