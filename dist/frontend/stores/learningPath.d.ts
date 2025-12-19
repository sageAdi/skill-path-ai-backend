import type { LearningPathResponse, PathNode } from '~/services/types';
export declare const useLearningPathStore: import("pinia").StoreDefinition<"learningPath", {
    path: LearningPathResponse | null;
    isLoading: boolean;
    error: string | null;
}, {
    nodes: (state: {
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    } & import("pinia").PiniaCustomStateProperties<{
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    }>) => PathNode[];
    completedNodes: (state: {
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    } & import("pinia").PiniaCustomStateProperties<{
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    }>) => PathNode[];
    inProgressNodes: (state: {
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    } & import("pinia").PiniaCustomStateProperties<{
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    }>) => PathNode[];
    pendingNodes: (state: {
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    } & import("pinia").PiniaCustomStateProperties<{
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    }>) => PathNode[];
    revisionNodes: (state: {
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    } & import("pinia").PiniaCustomStateProperties<{
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    }>) => PathNode[];
    microPracticeNodes: (state: {
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    } & import("pinia").PiniaCustomStateProperties<{
        path: LearningPathResponse | null;
        isLoading: boolean;
        error: string | null;
    }>) => PathNode[];
}, {
    setPath(path: LearningPathResponse | null): void;
    setLoading(isLoading: boolean): void;
    setError(error: string | null): void;
}>;
