import { useApi } from '~/composables/useApi';
export const progressService = {
    async getProgressSummary() {
        const api = useApi();
        return api.get('/progress/summary');
    },
    async getProgressBySkill(skillId) {
        const api = useApi();
        return api.get(`/progress/skill/${skillId}`);
    },
    async updateProgress(updateProgressDto) {
        const api = useApi();
        return api.post('/progress/update', updateProgressDto);
    },
};
//# sourceMappingURL=progress.service.js.map