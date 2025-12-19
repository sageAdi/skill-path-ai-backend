import { useApi } from '~/composables/useApi';
export const skillsService = {
    async getAllSkills() {
        const api = useApi();
        return api.get('/skills');
    },
    async getSkillById(id) {
        const api = useApi();
        return api.get(`/skills/${id}`);
    },
};
//# sourceMappingURL=skills.service.js.map