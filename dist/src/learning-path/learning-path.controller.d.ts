import { LearningPathService } from './learning-path.service';
import { GenerateRoadmapDto, GenerateRoadmapResponseDto } from './dto/generate-roadmap.dto';
export declare class LearningPathController {
    private readonly learningPathService;
    constructor(learningPathService: LearningPathService);
    getLearningPath(user: {
        id: string;
    }): Promise<import("./interfaces/path-node.interface").LearningPathResponse>;
    adaptPath(user: {
        id: string;
    }): Promise<import("./interfaces/path-node.interface").LearningPathResponse>;
    generateRoadmap(user: {
        id: string;
    }, dto: GenerateRoadmapDto): Promise<GenerateRoadmapResponseDto>;
}
