import { useApi } from '~/composables/useApi';
export const authService = {
    async register(registerDto) {
        const api = useApi();
        return api.post('/auth/register', registerDto);
    },
    async login(loginDto) {
        const api = useApi();
        return api.post('/auth/login', loginDto);
    },
};
//# sourceMappingURL=auth.service.js.map