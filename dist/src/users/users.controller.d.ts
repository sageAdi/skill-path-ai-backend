import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: {
        id: string;
    }): Promise<{
        email: string;
        learningRole: string | null;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(user: {
        id: string;
    }, updateProfileDto: UpdateProfileDto): Promise<{
        email: string;
        learningRole: string | null;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
