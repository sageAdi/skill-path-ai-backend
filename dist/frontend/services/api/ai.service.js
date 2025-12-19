import { useApi } from '~/composables/useApi';
export const aiService = {
    async explainAnswer(explainAnswerDto) {
        const api = useApi();
        return api.post('/ai/explain', explainAnswerDto);
    },
};
//# sourceMappingURL=ai.service.js.map