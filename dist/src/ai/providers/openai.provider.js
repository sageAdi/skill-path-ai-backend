"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var OpenAIProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let OpenAIProvider = OpenAIProvider_1 = class OpenAIProvider {
    configService;
    logger = new common_1.Logger(OpenAIProvider_1.name);
    openai;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey) {
            this.logger.warn('OPENAI_API_KEY not found. AI features will not work.');
        }
        this.openai = new openai_1.default({
            apiKey: apiKey || 'dummy-key',
        });
    }
    async generateQuestions(context, skillName, count = 5) {
        try {
            const prompt = skillName
                ? `Generate ${count} multiple-choice assessment questions about "${skillName}" for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`
                : `Generate ${count} multiple-choice assessment questions for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`;
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert educational assessment creator. Generate clear, well-structured multiple-choice questions. Always return valid JSON.',
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
            const parsed = JSON.parse(content);
            const response = parsed;
            const questions = Array.isArray(parsed)
                ? parsed
                : response.questions || [];
            return questions
                .slice(0, count)
                .map((q) => {
                const qObj = q;
                const answerIndex = qObj.correctAnswerIndex ?? qObj.correctAnswer;
                const answerIndexStr = typeof answerIndex === 'string' || typeof answerIndex === 'number'
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
                .filter((q) => q.question &&
                q.options.length === 4 &&
                q.correctAnswerIndex >= 0 &&
                q.correctAnswerIndex < 4);
        }
        catch (error) {
            this.logger.error('Error generating questions:', error);
            throw new Error('Failed to generate assessment questions');
        }
    }
    async explainAnswer(question, userAnswer, correctAnswer) {
        try {
            const prompt = `The user answered "${userAnswer}" to the question: "${question}". The correct answer is "${correctAnswer}". Provide a clear, educational explanation of why the correct answer is correct and what the user might have misunderstood. Keep it concise (2-3 sentences).`;
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful educational tutor explaining answers to learners.',
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
            return (explanation ||
                'The correct answer is the best choice based on the question requirements.');
        }
        catch (error) {
            this.logger.error('Error explaining answer:', error);
            return 'Unable to generate explanation at this time.';
        }
    }
    async suggestPathAdjustments(progressData, currentPath) {
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
                        content: 'You are an adaptive learning system that suggests learning path improvements based on student performance.',
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
            const parsed = JSON.parse(content);
            const response = parsed;
            const suggestions = Array.isArray(parsed)
                ? parsed
                : response.suggestions || [];
            const validActions = [
                'INSERT_REVISION',
                'INSERT_MICRO_PRACTICE',
                'SKIP_SKILL',
                'REORDER',
            ];
            return suggestions
                .map((s) => {
                const sObj = s;
                const action = sObj.action || 'REORDER';
                const targetOrderValue = sObj.targetOrder !== undefined &&
                    (typeof sObj.targetOrder === 'string' ||
                        typeof sObj.targetOrder === 'number')
                    ? parseInt(String(sObj.targetOrder), 10)
                    : undefined;
                return {
                    action: validActions.includes(action)
                        ? action
                        : 'REORDER',
                    skillId: sObj.skillId || undefined,
                    targetOrder: targetOrderValue,
                    reason: String(sObj.reason || 'AI-suggested adjustment'),
                };
            })
                .filter((s) => validActions.includes(s.action));
        }
        catch (error) {
            this.logger.error('Error suggesting path adjustments:', error);
            return [];
        }
    }
};
exports.OpenAIProvider = OpenAIProvider;
exports.OpenAIProvider = OpenAIProvider = OpenAIProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAIProvider);
//# sourceMappingURL=openai.provider.js.map