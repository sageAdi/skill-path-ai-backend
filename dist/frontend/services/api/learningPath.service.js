import { useApi } from '~/composables/useApi';
export const learningPathService = {
    async getLearningPath() {
        const api = useApi();
        return api.get('/learning-path');
    },
    async adaptPath() {
        const api = useApi();
        return api.post('/learning-path/adapt', {});
    },
};
//# sourceMappingURL=learningPath.service.js.map