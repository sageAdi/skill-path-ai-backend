import type { LearningPathResponse } from '~/services/types';
export declare const learningPathService: {
    getLearningPath(): Promise<LearningPathResponse>;
    adaptPath(): Promise<LearningPathResponse>;
};
