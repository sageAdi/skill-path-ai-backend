import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  IAIProvider,
  GeneratedQuestion,
  PathAdjustmentSuggestion,
} from '../interfaces/ai-provider.interface';

// Type definitions for OpenAI JSON responses
interface OpenAIQuestionResponse {
  questions?: Array<{
    question?: string;
    options?: unknown[];
    correctAnswerIndex?: number | string;
    correctAnswer?: number | string;
    explanation?: string;
  }>;
}

interface OpenAISuggestionResponse {
  suggestions?: Array<{
    action?: string;
    skillId?: string;
    targetOrder?: number | string;
    reason?: string;
  }>;
}

@Injectable()
export class OpenAIProvider implements IAIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not found. AI features will not work.');
    }
    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
    });
  }

  async generateQuestions(
    context: string,
    skillName?: string,
    count: number = 5,
  ): Promise<GeneratedQuestion[]> {
    try {
      const prompt = skillName
        ? `Generate ${count} multiple-choice assessment questions about "${skillName}" for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`
        : `Generate ${count} multiple-choice assessment questions for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert educational assessment creator. Generate clear, well-structured multiple-choice questions. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse JSON response - OpenAI returns an object with "questions" array when using json_object format
      const parsed = JSON.parse(content) as unknown;
      const response = parsed as OpenAIQuestionResponse;
      const questions = Array.isArray(parsed)
        ? parsed
        : response.questions || [];

      // Validate and sanitize questions
      return questions
        .slice(0, count)
        .map((q) => {
          const qObj = q as {
            question?: string;
            options?: unknown[];
            correctAnswerIndex?: unknown;
            correctAnswer?: unknown;
            explanation?: string;
          };
          const answerIndex = qObj.correctAnswerIndex ?? qObj.correctAnswer;
          const answerIndexStr =
            typeof answerIndex === 'string' || typeof answerIndex === 'number'
              ? String(answerIndex)
              : '0';
          return {
            question: String(qObj.question || '').trim(),
            options: Array.isArray(qObj.options)
              ? qObj.options.map(String)
              : [],
            correctAnswerIndex: parseInt(answerIndexStr, 10),
            explanation: qObj.explanation
              ? String(qObj.explanation).trim()
              : undefined,
          };
        })
        .filter(
          (q) =>
            q.question &&
            q.options.length === 4 &&
            q.correctAnswerIndex >= 0 &&
            q.correctAnswerIndex < 4,
        );
    } catch (error) {
      this.logger.error('Error generating questions:', error);
      throw new Error('Failed to generate assessment questions');
    }
  }

  async explainAnswer(
    question: string,
    userAnswer: string,
    correctAnswer: string,
  ): Promise<string> {
    try {
      const prompt = `The user answered "${userAnswer}" to the question: "${question}". The correct answer is "${correctAnswer}". Provide a clear, educational explanation of why the correct answer is correct and what the user might have misunderstood. Keep it concise (2-3 sentences).`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful educational tutor explaining answers to learners.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const explanation = completion.choices[0]?.message?.content?.trim();
      return (
        explanation ||
        'The correct answer is the best choice based on the question requirements.'
      );
    } catch (error) {
      this.logger.error('Error explaining answer:', error);
      return 'Unable to generate explanation at this time.';
    }
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
    try {
      const progressSummary = progressData
        .map((p) => `${p.skillName}: Score ${p.score}%, ${p.attempts} attempts`)
        .join('\n');

      const pathSummary = currentPath
        .map((p) => `${p.order}. ${p.skillName}`)
        .join('\n');

      const prompt = `Based on this learning progress:
${progressSummary}

And current learning path:
${pathSummary}

Suggest learning path adjustments. Return JSON array: [{"action": "INSERT_REVISION"|"INSERT_MICRO_PRACTICE"|"SKIP_SKILL"|"REORDER", "skillId": "uuid or null", "targetOrder": number or null, "reason": "explanation"}]. Only suggest if there are clear learning gaps or issues.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an adaptive learning system that suggests learning path improvements based on student performance.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const parsed = JSON.parse(content) as unknown;
      const response = parsed as OpenAISuggestionResponse;
      const suggestions = Array.isArray(parsed)
        ? parsed
        : response.suggestions || [];

      const validActions: PathAdjustmentSuggestion['action'][] = [
        'INSERT_REVISION',
        'INSERT_MICRO_PRACTICE',
        'SKIP_SKILL',
        'REORDER',
      ];

      return suggestions
        .map((s) => {
          const sObj = s as {
            action?: string;
            skillId?: string;
            targetOrder?: unknown;
            reason?: string;
          };
          const action = sObj.action || 'REORDER';
          const targetOrderValue =
            sObj.targetOrder !== undefined &&
            (typeof sObj.targetOrder === 'string' ||
              typeof sObj.targetOrder === 'number')
              ? parseInt(String(sObj.targetOrder), 10)
              : undefined;
          return {
            action: validActions.includes(
              action as PathAdjustmentSuggestion['action'],
            )
              ? (action as PathAdjustmentSuggestion['action'])
              : 'REORDER',
            skillId: sObj.skillId || undefined,
            targetOrder: targetOrderValue,
            reason: String(sObj.reason || 'AI-suggested adjustment'),
          };
        })
        .filter((s) => validActions.includes(s.action));
    } catch (error) {
      this.logger.error('Error suggesting path adjustments:', error);
      return [];
    }
  }
}
