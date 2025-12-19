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
var OllamaProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let OllamaProvider = OllamaProvider_1 = class OllamaProvider {
    configService;
    logger = new common_1.Logger(OllamaProvider_1.name);
    baseUrl;
    model;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl =
            this.configService.get('OLLAMA_BASE_URL') ||
                'http://localhost:11434';
        this.model =
            this.configService.get('OLLAMA_MODEL') || 'llama3.2:3b';
        this.logger.log(`Ollama provider initialized with model: ${this.model} at ${this.baseUrl}`);
    }
    async ollamaRequest(prompt, systemPrompt, jsonMode = false) {
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
            const data = (await response.json());
            return data.response || '';
        }
        catch (error) {
            this.logger.error('Ollama API request failed:', error);
            throw error;
        }
    }
    async generateQuestions(context, skillName, count = 5) {
        try {
            const prompt = skillName
                ? `Generate ${count} multiple-choice assessment questions about "${skillName}" for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`
                : `Generate ${count} multiple-choice assessment questions for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`;
            const systemPrompt = 'You are an expert educational assessment creator. Generate clear, well-structured multiple-choice questions. Always return valid JSON.';
            const content = await this.ollamaRequest(prompt, systemPrompt, true);
            if (!content) {
                throw new Error('Empty response from Ollama');
            }
            let parsed;
            try {
                parsed = JSON.parse(content);
            }
            catch {
                const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                    content.match(/```\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[1]);
                }
                else {
                    throw new Error('Failed to parse JSON response from Ollama');
                }
            }
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
            const systemPrompt = 'You are a helpful educational tutor explaining answers to learners.';
            const explanation = await this.ollamaRequest(prompt, systemPrompt, false);
            return (explanation.trim() ||
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

Suggest learning path adjustments. Return JSON object with "suggestions" array: {"suggestions": [{"action": "INSERT_REVISION"|"INSERT_MICRO_PRACTICE"|"SKIP_SKILL"|"REORDER", "skillId": "uuid or null", "targetOrder": number or null, "reason": "explanation"}]}. Only suggest if there are clear learning gaps or issues.`;
            const systemPrompt = 'You are an adaptive learning system that suggests learning path improvements based on student performance. Always return valid JSON.';
            const content = await this.ollamaRequest(prompt, systemPrompt, true);
            if (!content) {
                return [];
            }
            let parsed;
            try {
                parsed = JSON.parse(content);
            }
            catch {
                const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                    content.match(/```\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[1]);
                }
                else {
                    this.logger.warn('Failed to parse suggestions JSON, returning empty array');
                    return [];
                }
            }
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
exports.OllamaProvider = OllamaProvider;
exports.OllamaProvider = OllamaProvider = OllamaProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OllamaProvider);
//# sourceMappingURL=ollama.provider.js.map