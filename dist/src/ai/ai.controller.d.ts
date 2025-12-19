import { AIService } from './ai.service';
declare class ExplainAnswerDto {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
}
export declare class AIController {
    private readonly aiService;
    constructor(aiService: AIService);
    explainAnswer(dto: ExplainAnswerDto): Promise<{
        explanation: string;
    }>;
}
export {};
