import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IAIProvider,
  GeneratedQuestion,
  PathAdjustmentSuggestion,
} from '../interfaces/ai-provider.interface';

// Type definitions for Ollama API responses
interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaQuestionResponse {
  questions?: Array<{
    question?: string;
    options?: unknown[];
    correctAnswerIndex?: number | string;
    correctAnswer?: number | string;
    explanation?: string;
  }>;
}

interface OllamaSuggestionResponse {
  suggestions?: Array<{
    action?: string;
    skillId?: string;
    targetOrder?: number | string;
    reason?: string;
  }>;
}

@Injectable()
export class OllamaProvider implements IAIProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    // Default to local Ollama instance
    this.baseUrl =
      this.configService.get<string>('OLLAMA_BASE_URL') ||
      'http://localhost:11434';
    this.model =
      this.configService.get<string>('OLLAMA_MODEL') || 'llama3.2:3b';
    this.logger.log(
      `Ollama provider initialized with model: ${this.model} at ${this.baseUrl}`,
    );
  }

  /**
   * Make a request to Ollama API
   */
  private async ollamaRequest(
    prompt: string,
    systemPrompt: string,
    jsonMode: boolean = false,
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: `${systemPrompt}\n\n${prompt}`,
          stream: false,
          format: jsonMode ? 'json' : undefined,
          options: {
            temperature: 0.7,
            ...(jsonMode && { response_format: { type: 'json_object' } }),
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as OllamaGenerateResponse;
      return data.response || '';
    } catch (error) {
      this.logger.error('Ollama API request failed:', error);
      throw error;
    }
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

      const systemPrompt =
        'You are an expert educational assessment creator. Generate clear, well-structured multiple-choice questions. Always return valid JSON.';

      const content = await this.ollamaRequest(prompt, systemPrompt, true);

      if (!content) {
        throw new Error('Empty response from Ollama');
      }

      // Parse JSON response
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Sometimes Ollama returns JSON wrapped in markdown code blocks
        const jsonMatch =
          content.match(/```json\s*([\s\S]*?)\s*```/) ||
          content.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse JSON response from Ollama');
        }
      }

      const response = parsed as OllamaQuestionResponse;
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

      const systemPrompt =
        'You are a helpful educational tutor explaining answers to learners.';

      const explanation = await this.ollamaRequest(prompt, systemPrompt, false);
      return (
        explanation.trim() ||
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

Suggest learning path adjustments. Return JSON object with "suggestions" array: {"suggestions": [{"action": "INSERT_REVISION"|"INSERT_MICRO_PRACTICE"|"SKIP_SKILL"|"REORDER", "skillId": "uuid or null", "targetOrder": number or null, "reason": "explanation"}]}. Only suggest if there are clear learning gaps or issues.`;

      const systemPrompt =
        'You are an adaptive learning system that suggests learning path improvements based on student performance. Always return valid JSON.';

      const content = await this.ollamaRequest(prompt, systemPrompt, true);

      if (!content) {
        return [];
      }

      // Parse JSON response
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Sometimes Ollama returns JSON wrapped in markdown code blocks
        const jsonMatch =
          content.match(/```json\s*([\s\S]*?)\s*```/) ||
          content.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          this.logger.warn(
            'Failed to parse suggestions JSON, returning empty array',
          );
          return [];
        }
      }

      const response = parsed as OllamaSuggestionResponse;
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
