import { ApiErrorException } from '~/services/types';
import { useRuntimeConfig, navigateTo } from '#app';
import { useAuthStore } from '~/stores/auth';
const TOKEN_KEY = 'nuxt:auth:token';
export const useApi = () => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const getBaseUrl = () => {
        return config.public.apiBaseUrl || 'http://localhost:3000';
    };
    const getToken = () => {
        if (typeof window === 'undefined')
            return null;
        return authStore.token || localStorage.getItem(TOKEN_KEY);
    };
    const setToken = (token) => {
        if (typeof window === 'undefined')
            return;
        if (token) {
            authStore.setToken(token);
            localStorage.setItem(TOKEN_KEY, token);
        }
        else {
            authStore.setToken(null);
            localStorage.removeItem(TOKEN_KEY);
        }
    };
    const apiRequest = async (endpoint, options = {}) => {
        const baseUrl = getBaseUrl();
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers,
            });
            if (response.status === 401) {
                setToken(null);
                authStore.logout();
                if (typeof window !== 'undefined') {
                    await navigateTo('/login');
                }
                throw new Error('Authentication required');
            }
            const data = (await response.json());
            if (!response.ok) {
                const errorData = data;
                const apiError = {
                    message: errorData.message || 'An error occurred',
                    statusCode: response.status,
                    error: errorData.error,
                };
                const exception = new ApiErrorException(apiError);
                throw exception;
            }
            return data;
        }
        catch (error) {
            if (error instanceof ApiErrorException) {
                throw error;
            }
            const networkError = {
                message: 'Network error. Please check your connection.',
                statusCode: 0,
            };
            const exception = new ApiErrorException(networkError);
            throw exception;
        }
    };
    const get = (endpoint) => {
        return apiRequest(endpoint, { method: 'GET' });
    };
    const post = (endpoint, body) => {
        return apiRequest(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    };
    const patch = (endpoint, body) => {
        return apiRequest(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    };
    const del = (endpoint) => {
        return apiRequest(endpoint, { method: 'DELETE' });
    };
    return {
        get,
        post,
        patch,
        delete: del,
        setToken,
        getToken,
    };
};
//# sourceMappingURL=useApi.js.map