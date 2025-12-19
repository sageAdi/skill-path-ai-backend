import { useApi } from '~/composables/useApi';
export const usersService = {
    async getProfile() {
        const api = useApi();
        return api.get('/users/profile');
    },
    async updateProfile(updateProfileDto) {
        const api = useApi();
        return api.patch('/users/profile', updateProfileDto);
    },
};
//# sourceMappingURL=users.service.js.map