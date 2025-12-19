import type { AuthResponse, LoginDto, RegisterDto, User } from '~/services/types';
export declare const useAuth: () => {
    register: (registerDto: RegisterDto) => Promise<AuthResponse>;
    login: (loginDto: LoginDto) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    isAuthenticated: () => boolean;
    getCurrentUser: () => User | null;
    fetchProfile: () => Promise<User>;
};
