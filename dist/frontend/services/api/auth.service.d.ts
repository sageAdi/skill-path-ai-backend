import type { AuthResponse, LoginDto, RegisterDto } from '~/services/types';
export declare const authService: {
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
};
