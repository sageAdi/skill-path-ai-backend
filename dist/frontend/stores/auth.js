import { defineStore } from 'pinia';
const TOKEN_KEY = 'nuxt:auth:token';
export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: null,
        user: null,
    }),
    getters: {
        isAuthenticated: (state) => {
            return !!state.token && !!state.user;
        },
        userEmail: (state) => {
            return state.user?.email || null;
        },
        userRole: (state) => {
            return state.user?.role || null;
        },
    },
    actions: {
        setToken(token) {
            this.token = token;
            if (typeof window !== 'undefined') {
                if (token) {
                    localStorage.setItem(TOKEN_KEY, token);
                }
                else {
                    localStorage.removeItem(TOKEN_KEY);
                }
            }
        },
        setUser(user) {
            this.user = user;
        },
        logout() {
            this.token = null;
            this.user = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem(TOKEN_KEY);
            }
        },
        init() {
            if (typeof window !== 'undefined') {
                const storedToken = localStorage.getItem(TOKEN_KEY);
                if (storedToken) {
                    this.token = storedToken;
                }
            }
        },
    },
});
//# sourceMappingURL=auth.js.map