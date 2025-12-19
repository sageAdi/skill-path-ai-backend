import { defineNuxtConfig } from 'nuxt/config';
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
    css: ['~/assets/css/main.css'],
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
        },
    },
    typescript: {
        strict: true,
        typeCheck: process.env.NODE_ENV === 'development',
    },
});
//# sourceMappingURL=nuxt.config.js.map