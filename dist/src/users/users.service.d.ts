import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        email: string;
        learningRole: string | null;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        email: string;
        learningRole: string | null;
        id: string;
        role: import("@prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
