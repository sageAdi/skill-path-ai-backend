import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CareerTransitionsResponseDto } from './dto/career-transitions.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: {
        id: string;
    }): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        learningRole: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(user: {
        id: string;
    }, updateProfileDto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        learningRole: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCareerTransitions(currentRole: string): Promise<CareerTransitionsResponseDto>;
}
