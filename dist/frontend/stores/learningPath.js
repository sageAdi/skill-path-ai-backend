import { defineStore } from 'pinia';
export const useLearningPathStore = defineStore('learningPath', {
    state: () => ({
        path: null,
        isLoading: false,
        error: null,
    }),
    getters: {
        nodes: (state) => {
            return state.path?.nodes || [];
        },
        completedNodes: (state) => {
            return state.path?.nodes.filter((node) => node.status === 'COMPLETED') || [];
        },
        inProgressNodes: (state) => {
            return state.path?.nodes.filter((node) => node.status === 'IN_PROGRESS') || [];
        },
        pendingNodes: (state) => {
            return state.path?.nodes.filter((node) => node.status === 'PENDING') || [];
        },
        revisionNodes: (state) => {
            return state.path?.nodes.filter((node) => node.nodeType === 'REVISION') || [];
        },
        microPracticeNodes: (state) => {
            return state.path?.nodes.filter((node) => node.nodeType === 'MICRO_PRACTICE') || [];
        },
    },
    actions: {
        setPath(path) {
            this.path = path;
        },
        setLoading(isLoading) {
            this.isLoading = isLoading;
        },
        setError(error) {
            this.error = error;
        },
    },
});
//# sourceMappingURL=learningPath.js.map