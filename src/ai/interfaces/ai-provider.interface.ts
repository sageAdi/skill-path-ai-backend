export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface PathAdjustmentSuggestion {
  action:
    | 'INSERT_REVISION'
    | 'INSERT_MICRO_PRACTICE'
    | 'SKIP_SKILL'
    | 'REORDER';
  skillId?: string;
  targetOrder?: number;
  reason: string;
}

export interface IAIProvider {
  /**
   * Generate assessment questions for a role or skill
   */
  generateQuestions(
    context: string,
    skillName?: string,
    count?: number,
  ): Promise<GeneratedQuestion[]>;

  /**
   * Explain why an answer is wrong or correct
   */
  explainAnswer(
    question: string,
    userAnswer: string,
    correctAnswer: string,
  ): Promise<string>;

  /**
   * Suggest learning path adjustments based on progress data
   */
  suggestPathAdjustments(
    progressData: Array<{
      skillId: string;
      skillName: string;
      score: number;
      attempts: number;
    }>,
    currentPath: Array<{ skillId: string; skillName: string; order: number }>,
  ): Promise<PathAdjustmentSuggestion[]>;
}
