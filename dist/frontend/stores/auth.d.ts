import type { User } from '~/services/types';
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", {
    token: string | null;
    user: User | null;
}, {
    isAuthenticated: (state: {
        token: string | null;
        user: User | null;
    } & import("pinia").PiniaCustomStateProperties<{
        token: string | null;
        user: User | null;
    }>) => boolean;
    userEmail: (state: {
        token: string | null;
        user: User | null;
    } & import("pinia").PiniaCustomStateProperties<{
        token: string | null;
        user: User | null;
    }>) => string | null;
    userRole: (state: {
        token: string | null;
        user: User | null;
    } & import("pinia").PiniaCustomStateProperties<{
        token: string | null;
        user: User | null;
    }>) => string | null;
}, {
    setToken(token: string | null): void;
    setUser(user: User | null): void;
    logout(): void;
    init(): void;
}>;
