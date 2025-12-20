import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CareerTransitionsResponseDto } from './dto/career-transitions.dto';
import { UpskillingSuggestionsResponseDto } from './dto/upskilling-suggestions.dto';
import { AIService } from '../ai/ai.service';
export declare class UsersService {
    private prisma;
    private aiService;
    constructor(prisma: PrismaService, aiService: AIService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        learningRole: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        learningRole: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getCareerTransitions(currentRole: string): Promise<CareerTransitionsResponseDto>;
    getUpskillingSuggestions(currentRole: string): Promise<UpskillingSuggestionsResponseDto>;
}
