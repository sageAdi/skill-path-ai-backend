import { LearningPathService } from './learning-path.service';
export declare class LearningPathController {
    private readonly learningPathService;
    constructor(learningPathService: LearningPathService);
    getLearningPath(user: {
        id: string;
    }): Promise<import("./interfaces/path-node.interface").LearningPathResponse>;
    adaptPath(user: {
        id: string;
    }): Promise<import("./interfaces/path-node.interface").LearningPathResponse>;
}
