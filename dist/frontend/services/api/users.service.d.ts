import type { User } from '~/services/types';
export interface UpdateProfileDto {
    learningRole?: string;
}
export declare const usersService: {
    getProfile(): Promise<User>;
    updateProfile(updateProfileDto: UpdateProfileDto): Promise<User>;
};
