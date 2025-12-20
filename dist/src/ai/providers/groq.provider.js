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
var GroqProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const groq_sdk_1 = __importDefault(require("groq-sdk"));
let GroqProvider = GroqProvider_1 = class GroqProvider {
    configService;
    logger = new common_1.Logger(GroqProvider_1.name);
    groq;
    model;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GROQ_API_KEY');
        if (!apiKey) {
            this.logger.warn('GROQ_API_KEY not found. AI features will not work.');
        }
        this.groq = new groq_sdk_1.default({
            apiKey: apiKey || 'dummy-key',
        });
        this.model =
            this.configService.get('GROQ_MODEL') || 'llama-3.1-8b-instant';
        this.logger.log(`Groq provider initialized with model: ${this.model}`);
    }
    async generateQuestions(context, skillName, count = 5) {
        try {
            const prompt = skillName
                ? `Generate ${count} multiple-choice assessment questions about "${skillName}" for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`
                : `Generate ${count} multiple-choice assessment questions for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`;
            const completion = await this.groq.chat.completions.create({
                model: this.model,
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
                throw new Error('Empty response from Groq');
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
                    throw new Error('Failed to parse JSON response from Groq');
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
            const completion = await this.groq.chat.completions.create({
                model: this.model,
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

Suggest learning path adjustments. Return JSON object with "suggestions" array: {"suggestions": [{"action": "INSERT_REVISION"|"INSERT_MICRO_PRACTICE"|"SKIP_SKILL"|"REORDER", "skillId": "uuid or null", "targetOrder": number or null, "reason": "explanation"}]}. Only suggest if there are clear learning gaps or issues.`;
            const completion = await this.groq.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an adaptive learning system that suggests learning path improvements based on student performance. Always return valid JSON.',
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
    async suggestCareerTransitions(currentRole) {
        try {
            const prompt = `Given the current career role: "${currentRole}", suggest exactly 4 career transition options that would be realistic and valuable for someone in this role. 

For each transition, provide:
- role: The target career role name
- description: A brief explanation of what this transition involves (1-2 sentences)
- transitionDifficulty: One of "Easy", "Medium", or "Hard" based on how difficult the transition would be
- commonSkills: An array of 3-5 key skills or technologies needed for this transition

Return the response as a JSON object with a "transitions" array:
{
  "transitions": [
    {
      "role": "Role Name",
      "description": "Brief description",
      "transitionDifficulty": "Easy|Medium|Hard",
      "commonSkills": ["Skill1", "Skill2", "Skill3"]
    }
  ]
}

Make sure to provide exactly 4 diverse transition options that cover different career directions (e.g., technical advancement, lateral moves, specialization, leadership).`;
            const completion = await this.groq.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a career counselor expert specializing in tech career transitions. Provide realistic, actionable career transition suggestions based on the current role. Always return valid JSON with exactly 4 transitions.',
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
                throw new Error('Empty response from Groq');
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
                    throw new Error('Failed to parse JSON response from Groq');
                }
            }
            const response = parsed;
            const transitions = Array.isArray(parsed)
                ? parsed
                : response.transitions || [];
            const validDifficulties = [
                'Easy',
                'Medium',
                'Hard',
            ];
            const sanitized = transitions
                .slice(0, 4)
                .map((t) => {
                const tObj = t;
                let skills = [];
                if (Array.isArray(tObj.commonSkills)) {
                    skills = tObj.commonSkills.map(String);
                }
                else if (typeof tObj.commonSkills === 'string') {
                    try {
                        const parsed = JSON.parse(tObj.commonSkills);
                        skills = Array.isArray(parsed)
                            ? parsed.map(String)
                            : [String(tObj.commonSkills)];
                    }
                    catch {
                        skills = [String(tObj.commonSkills)];
                    }
                }
                const difficulty = tObj.transitionDifficulty || 'Medium';
                return {
                    role: String(tObj.role || 'Unknown Role').trim(),
                    description: String(tObj.description || '').trim(),
                    transitionDifficulty: validDifficulties.includes(difficulty)
                        ? difficulty
                        : 'Medium',
                    commonSkills: skills.filter((s) => s.trim().length > 0),
                };
            })
                .filter((t) => t.role &&
                t.role !== 'Unknown Role' &&
                t.description &&
                t.commonSkills.length > 0);
            if (sanitized.length < 4) {
                this.logger.warn(`Only received ${sanitized.length} valid transitions, expected 4`);
            }
            return sanitized.slice(0, 4);
        }
        catch (error) {
            this.logger.error('Error generating career transitions:', error);
            throw new Error('Failed to generate career transition suggestions');
        }
    }
    async generateCareerRoadmap(assessmentData, targetRole, availableSkills) {
        try {
            const weakAreasStr = assessmentData.weakAreas.length > 0
                ? assessmentData.weakAreas.join(', ')
                : 'None identified';
            const strengthsStr = assessmentData.strengths.length > 0
                ? assessmentData.strengths.join(', ')
                : 'Assessment in progress';
            const skillsList = availableSkills
                .map((s) => `- ${s.name} (${s.difficulty})${s.description ? ': ' + s.description : ''}`)
                .join('\n');
            const prompt = `You are a career development expert. Generate a comprehensive learning roadmap.

Current Assessment Results:
- Score: ${assessmentData.score}%
- Correct: ${assessmentData.correctAnswers}/${assessmentData.totalQuestions}
- Weak Areas: ${weakAreasStr}
- Strengths: ${strengthsStr}

Target Role: ${targetRole}

Available Skills to choose from:
${skillsList}

Generate a personalized learning roadmap with:
1. Select 8-12 relevant skills from the available list that are most important for "${targetRole}"
2. Order them logically (prerequisites first, foundational skills before advanced)
3. Estimate realistic learning time in weeks for each skill
4. Assign priority (high/medium/low) based on importance for the target role
5. Suggest 2-3 learning resources per skill WITH ACTUAL URLs (courses, documentation, tutorials)
6. Define 2-3 achievable milestones per skill
7. Provide overall recommendations based on the assessment results

IMPORTANT: 
- Only select skills from the available list provided above. Use exact skill names.
- For resources, provide actual clickable URLs in format "Resource Name - https://example.com/path"

Return JSON in this exact format:
{
  "targetRole": "${targetRole}",
  "totalEstimatedWeeks": <sum of all estimated weeks>,
  "skills": [
    {
      "skillName": "<exact name from available skills>",
      "estimatedWeeks": <number>,
      "priority": "high" | "medium" | "low",
      "resources": [
        "MDN Web Docs - https://developer.mozilla.org/",
        "FreeCodeCamp Course - https://www.freecodecamp.org/learn",
        "Official Documentation - https://docs.example.com"
      ],
      "milestones": ["<milestone 1>", "<milestone 2>", "<milestone 3>"],
      "prerequisites": ["<optional prerequisite skill names>"]
    }
  ],
  "recommendations": "<personalized recommendations based on assessment>"
}`;
            const completion = await this.groq.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a career development expert specializing in creating personalized learning roadmaps. Provide realistic, actionable learning paths based on assessment results and career goals. Always return valid JSON.',
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
                throw new Error('Empty response from Groq');
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
                    throw new Error('Failed to parse JSON response from Groq');
                }
            }
            const response = parsed;
            if (!response.skills || !Array.isArray(response.skills)) {
                throw new Error('Invalid roadmap response: missing skills array');
            }
            const validPriorities = [
                'high',
                'medium',
                'low',
            ];
            const sanitizedSkills = response.skills
                .map((skill) => {
                const weeks = typeof skill.estimatedWeeks === 'number'
                    ? skill.estimatedWeeks
                    : typeof skill.estimatedWeeks === 'string'
                        ? parseInt(skill.estimatedWeeks, 10)
                        : 1;
                let resources = [];
                if (Array.isArray(skill.resources)) {
                    resources = skill.resources.map(String);
                }
                else if (typeof skill.resources === 'string') {
                    try {
                        const parsed = JSON.parse(skill.resources);
                        resources = Array.isArray(parsed) ? parsed.map(String) : [];
                    }
                    catch {
                        resources = [];
                    }
                }
                let milestones = [];
                if (Array.isArray(skill.milestones)) {
                    milestones = skill.milestones.map(String);
                }
                else if (typeof skill.milestones === 'string') {
                    try {
                        const parsed = JSON.parse(skill.milestones);
                        milestones = Array.isArray(parsed) ? parsed.map(String) : [];
                    }
                    catch {
                        milestones = [];
                    }
                }
                let prerequisites = [];
                if (Array.isArray(skill.prerequisites)) {
                    prerequisites = skill.prerequisites.map(String);
                }
                else if (typeof skill.prerequisites === 'string') {
                    try {
                        const parsed = JSON.parse(skill.prerequisites);
                        prerequisites = Array.isArray(parsed) ? parsed.map(String) : [];
                    }
                    catch {
                        prerequisites = [];
                    }
                }
                const priority = skill.priority || 'medium';
                return {
                    skillName: String(skill.skillName || '').trim(),
                    estimatedWeeks: isNaN(weeks) ? 1 : Math.max(1, weeks),
                    priority: validPriorities.includes(priority)
                        ? priority
                        : 'medium',
                    resources: resources.filter((r) => r.trim().length > 0),
                    milestones: milestones.filter((m) => m.trim().length > 0),
                    prerequisites: prerequisites.filter((p) => p.trim().length > 0),
                };
            })
                .filter((skill) => skill.skillName &&
                skill.estimatedWeeks > 0 &&
                skill.resources.length > 0 &&
                skill.milestones.length > 0);
            if (sanitizedSkills.length === 0) {
                throw new Error('No valid skills in roadmap response');
            }
            const totalWeeks = sanitizedSkills.reduce((sum, skill) => sum + skill.estimatedWeeks, 0);
            const totalEstimatedWeeks = typeof response.totalEstimatedWeeks === 'number'
                ? response.totalEstimatedWeeks
                : typeof response.totalEstimatedWeeks === 'string'
                    ? parseInt(response.totalEstimatedWeeks, 10)
                    : totalWeeks;
            return {
                targetRole: String(response.targetRole || targetRole).trim(),
                totalEstimatedWeeks: isNaN(totalEstimatedWeeks)
                    ? totalWeeks
                    : totalEstimatedWeeks,
                skills: sanitizedSkills,
                recommendations: String(response.recommendations || 'Focus on building a strong foundation.').trim(),
            };
        }
        catch (error) {
            this.logger.error('Error generating career roadmap:', error);
            throw new Error('Failed to generate career roadmap');
        }
    }
    async suggestUpskilling(currentRole) {
        const systemPrompt = `You are a career development expert specializing in upskilling strategies for working professionals.

Your task is to suggest 5-7 highly relevant skills that someone in their current role should learn to:
1. Excel in their current position
2. Stay relevant with industry trends
3. Increase their market value
4. Prepare for senior responsibilities

Focus on practical, actionable skills with realistic timelines.

IMPORTANT: Respond ONLY with a valid JSON object matching this exact structure:
{
  "currentRole": "string",
  "suggestedSkills": [
    {
      "skillName": "string",
      "description": "string (brief, 1-2 sentences)",
      "priority": "high" | "medium" | "low",
      "estimatedWeeks": number (realistic learning time),
      "benefits": ["benefit1", "benefit2", "benefit3"],
      "resources": ["resource1", "resource2", "resource3"]
    }
  ],
  "recommendations": "string (overall upskilling strategy advice)"
}

Do not include any markdown formatting, code blocks, or extra text. Return only the JSON object.`;
        const userPrompt = `Generate upskilling suggestions for: ${currentRole}

Consider:
- Current industry trends and emerging technologies
- Skills that complement their existing expertise
- Practical skills that can be learned while working
- Both technical and soft skills where applicable
- Realistic learning timelines (most skills: 2-8 weeks)

Prioritize skills that will have the most immediate impact on their performance and career growth.`;
        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                model: this.model,
                temperature: 0.7,
                max_tokens: 2000,
            });
            const content = completion.choices[0]?.message?.content || '';
            if (!content) {
                throw new Error('Empty response from AI provider');
            }
            const cleanedContent = content
                .trim()
                .replace(/^```json\n?/, '')
                .replace(/\n?```$/, '')
                .trim();
            const response = JSON.parse(cleanedContent);
            if (!response ||
                typeof response !== 'object' ||
                !('suggestedSkills' in response) ||
                !Array.isArray(response.suggestedSkills)) {
                throw new Error('Invalid response structure from AI provider');
            }
            const parsedResponse = response;
            const validPriorities = [
                'high',
                'medium',
                'low',
            ];
            const sanitizedSkills = parsedResponse
                .suggestedSkills.map((skill) => {
                const weeks = typeof skill.estimatedWeeks === 'number'
                    ? skill.estimatedWeeks
                    : typeof skill.estimatedWeeks === 'string'
                        ? parseInt(skill.estimatedWeeks, 10)
                        : 4;
                let benefits = [];
                if (Array.isArray(skill.benefits)) {
                    benefits = skill.benefits.map(String);
                }
                else if (typeof skill.benefits === 'string') {
                    try {
                        const parsed = JSON.parse(skill.benefits);
                        benefits = Array.isArray(parsed) ? parsed.map(String) : [];
                    }
                    catch {
                        benefits = [];
                    }
                }
                let resources = [];
                if (Array.isArray(skill.resources)) {
                    resources = skill.resources.map(String);
                }
                else if (typeof skill.resources === 'string') {
                    try {
                        const parsed = JSON.parse(skill.resources);
                        resources = Array.isArray(parsed) ? parsed.map(String) : [];
                    }
                    catch {
                        resources = [];
                    }
                }
                const priority = skill.priority || 'medium';
                return {
                    skillName: typeof skill.skillName === 'string' ? skill.skillName.trim() : '',
                    description: typeof skill.description === 'string'
                        ? skill.description.trim()
                        : '',
                    priority: validPriorities.includes(priority)
                        ? priority
                        : 'medium',
                    estimatedWeeks: isNaN(weeks) ? 4 : Math.max(1, Math.min(52, weeks)),
                    benefits: benefits.filter((b) => b.trim().length > 0),
                    resources: resources.filter((r) => r.trim().length > 0),
                };
            })
                .filter((skill) => skill.skillName &&
                skill.description &&
                skill.benefits.length > 0 &&
                skill.resources.length > 0);
            if (sanitizedSkills.length === 0) {
                throw new Error('No valid skills in upskilling response');
            }
            return {
                currentRole: typeof parsedResponse.currentRole === 'string'
                    ? parsedResponse.currentRole.trim()
                    : currentRole,
                suggestedSkills: sanitizedSkills,
                recommendations: typeof parsedResponse.recommendations === 'string'
                    ? parsedResponse.recommendations.trim()
                    : 'Focus on skills that align with your career goals and industry demands.',
            };
        }
        catch (error) {
            this.logger.error('Error generating upskilling suggestions:', error);
            throw new Error('Failed to generate upskilling suggestions');
        }
    }
};
exports.GroqProvider = GroqProvider;
exports.GroqProvider = GroqProvider = GroqProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GroqProvider);
//# sourceMappingURL=groq.provider.js.map