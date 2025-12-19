import type { AIExplanationResponse, ExplainAnswerDto } from '~/services/types';
export declare const aiService: {
    explainAnswer(explainAnswerDto: ExplainAnswerDto): Promise<AIExplanationResponse>;
};
