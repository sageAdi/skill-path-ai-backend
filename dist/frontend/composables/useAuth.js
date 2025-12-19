import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useApi } from './useApi';
export const useAuth = () => {
    const authStore = useAuthStore();
    const api = useApi();
    const router = useRouter();
    const register = async (registerDto) => {
        try {
            const response = await api.post('/auth/register', registerDto);
            authStore.setToken(response.access_token);
            authStore.setUser(response.user);
            return response;
        }
        catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };
    const login = async (loginDto) => {
        try {
            const response = await api.post('/auth/login', loginDto);
            authStore.setToken(response.access_token);
            authStore.setUser(response.user);
            return response;
        }
        catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };
    const logout = async () => {
        authStore.logout();
        api.setToken(null);
        await router.push('/login');
    };
    const isAuthenticated = () => {
        return authStore.isAuthenticated;
    };
    const getCurrentUser = () => {
        return authStore.user;
    };
    const fetchProfile = async () => {
        try {
            const user = await api.get('/users/profile');
            authStore.setUser(user);
            return user;
        }
        catch (error) {
            console.error('Fetch profile error:', error);
            throw error;
        }
    };
    return {
        register,
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        fetchProfile,
    };
};
//# sourceMappingURL=useAuth.js.map