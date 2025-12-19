import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '~/stores/auth';
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(to.path);
    if (!authStore.isAuthenticated && !isPublicRoute) {
        return navigateTo('/login');
    }
    if (authStore.isAuthenticated && isPublicRoute) {
        return navigateTo('/dashboard');
    }
});
//# sourceMappingURL=auth.js.map