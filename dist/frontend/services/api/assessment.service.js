import { useApi } from '~/composables/useApi';
export const assessmentService = {
    async startAssessment(startAssessmentDto) {
        const api = useApi();
        return api.post('/assessment/start', startAssessmentDto);
    },
    async submitAssessment(submitAssessmentDto) {
        const api = useApi();
        return api.post('/assessment/submit', submitAssessmentDto);
    },
    async getAssessment(id) {
        const api = useApi();
        return api.get(`/assessment/${id}`);
    },
};
//# sourceMappingURL=assessment.service.js.map