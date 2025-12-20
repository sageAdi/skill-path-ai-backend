import { Injectable, Inject } from '@nestjs/common';
import type { IAIProvider } from './interfaces/ai-provider.interface';
import type {
  GeneratedQuestion,
  PathAdjustmentSuggestion,
  CareerTransition,
} from './interfaces/ai-provider.interface';

@Injectable()
export class AIService {
  constructor(
    @Inject('AI_PROVIDER') private readonly aiProvider: IAIProvider,
  ) {}

  async generateQuestions(
    context: string,
    skillName?: string,
    count?: number,
  ): Promise<GeneratedQuestion[]> {
    return this.aiProvider.generateQuestions(context, skillName, count);
  }

  async explainAnswer(
    question: string,
    userAnswer: string,
    correctAnswer: string,
  ): Promise<string> {
    return this.aiProvider.explainAnswer(question, userAnswer, correctAnswer);
  }

  async suggestPathAdjustments(
    progressData: Array<{
      skillId: string;
      skillName: string;
      score: number;
      attempts: number;
    }>,
    currentPath: Array<{ skillId: string; skillName: string; order: number }>,
  ): Promise<PathAdjustmentSuggestion[]> {
    return this.aiProvider.suggestPathAdjustments(progressData, currentPath);
  }

  suggestCareerTransitions(currentRole: string): Promise<CareerTransition[]> {
    return this.aiProvider.suggestCareerTransitions(currentRole);
  }
}
