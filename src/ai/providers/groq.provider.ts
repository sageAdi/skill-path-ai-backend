import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import {
  IAIProvider,
  GeneratedQuestion,
  PathAdjustmentSuggestion,
  CareerTransition,
  CareerRoadmap,
  RoadmapSkill,
} from '../interfaces/ai-provider.interface';

// Type definitions for Groq JSON responses
interface GroqQuestionResponse {
  questions?: Array<{
    question?: string;
    options?: unknown[];
    correctAnswerIndex?: number | string;
    correctAnswer?: number | string;
    explanation?: string;
  }>;
}

interface GroqSuggestionResponse {
  suggestions?: Array<{
    action?: string;
    skillId?: string;
    targetOrder?: number | string;
    reason?: string;
  }>;
}

interface GroqCareerTransitionResponse {
  transitions?: Array<{
    role?: string;
    description?: string;
    transitionDifficulty?: string;
    commonSkills?: string[];
  }>;
}

interface GroqRoadmapResponse {
  targetRole?: string;
  totalEstimatedWeeks?: number | string;
  skills?: Array<{
    skillName?: string;
    estimatedWeeks?: number | string;
    priority?: string;
    resources?: unknown;
    milestones?: unknown;
    prerequisites?: unknown;
  }>;
  recommendations?: string;
}

@Injectable()
export class GroqProvider implements IAIProvider {
  private readonly logger = new Logger(GroqProvider.name);
  private readonly groq: Groq;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not found. AI features will not work.');
    }
    this.groq = new Groq({
      apiKey: apiKey || 'dummy-key',
    });
    // Use fast and free model - llama-3.1-8b-instant is recommended
    this.model =
      this.configService.get<string>('GROQ_MODEL') || 'llama-3.1-8b-instant';
    this.logger.log(`Groq provider initialized with model: ${this.model}`);
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

      const completion = await this.groq.chat.completions.create({
        model: this.model,
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
        throw new Error('Empty response from Groq');
      }

      // Parse JSON response
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Sometimes Groq returns JSON wrapped in markdown code blocks
        const jsonMatch =
          content.match(/```json\s*([\s\S]*?)\s*```/) ||
          content.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse JSON response from Groq');
        }
      }

      const response = parsed as GroqQuestionResponse;
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

      const completion = await this.groq.chat.completions.create({
        model: this.model,
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

Suggest learning path adjustments. Return JSON object with "suggestions" array: {"suggestions": [{"action": "INSERT_REVISION"|"INSERT_MICRO_PRACTICE"|"SKIP_SKILL"|"REORDER", "skillId": "uuid or null", "targetOrder": number or null, "reason": "explanation"}]}. Only suggest if there are clear learning gaps or issues.`;

      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an adaptive learning system that suggests learning path improvements based on student performance. Always return valid JSON.',
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

      // Parse JSON response
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Sometimes Groq returns JSON wrapped in markdown code blocks
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

      const response = parsed as GroqSuggestionResponse;
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

  async suggestCareerTransitions(
    currentRole: string,
  ): Promise<CareerTransition[]> {
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
            content:
              'You are a career counselor expert specializing in tech career transitions. Provide realistic, actionable career transition suggestions based on the current role. Always return valid JSON with exactly 4 transitions.',
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

      // Parse JSON response
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Sometimes Groq returns JSON wrapped in markdown code blocks
        const jsonMatch =
          content.match(/```json\s*([\s\S]*?)\s*```/) ||
          content.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse JSON response from Groq');
        }
      }

      const response = parsed as GroqCareerTransitionResponse;
      const transitions = Array.isArray(parsed)
        ? parsed
        : response.transitions || [];

      // Validate and sanitize transitions
      const validDifficulties: CareerTransition['transitionDifficulty'][] = [
        'Easy',
        'Medium',
        'Hard',
      ];

      const sanitized = transitions
        .slice(0, 4)
        .map((t) => {
          const tObj = t as {
            role?: string;
            description?: string;
            transitionDifficulty?: string;
            commonSkills?: unknown;
          };

          // Handle commonSkills - could be array or string
          let skills: string[] = [];
          if (Array.isArray(tObj.commonSkills)) {
            skills = tObj.commonSkills.map(String);
          } else if (typeof tObj.commonSkills === 'string') {
            // Try to parse if it's a JSON string
            try {
              const parsed: unknown = JSON.parse(tObj.commonSkills);
              skills = Array.isArray(parsed)
                ? parsed.map(String)
                : [String(tObj.commonSkills)];
            } catch {
              skills = [String(tObj.commonSkills)];
            }
          }

          const difficulty = tObj.transitionDifficulty || 'Medium';
          return {
            role: String(tObj.role || 'Unknown Role').trim(),
            description: String(tObj.description || '').trim(),
            transitionDifficulty: validDifficulties.includes(
              difficulty as CareerTransition['transitionDifficulty'],
            )
              ? (difficulty as CareerTransition['transitionDifficulty'])
              : 'Medium',
            commonSkills: skills.filter((s) => s.trim().length > 0),
          };
        })
        .filter(
          (t) =>
            t.role &&
            t.role !== 'Unknown Role' &&
            t.description &&
            t.commonSkills.length > 0,
        );

      // Ensure we have exactly 4 transitions
      if (sanitized.length < 4) {
        this.logger.warn(
          `Only received ${sanitized.length} valid transitions, expected 4`,
        );
      }

      return sanitized.slice(0, 4);
    } catch (error) {
      this.logger.error('Error generating career transitions:', error);
      throw new Error('Failed to generate career transition suggestions');
    }
  }

  async generateCareerRoadmap(
    assessmentData: {
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      weakAreas: string[];
      strengths: string[];
    },
    targetRole: string,
    availableSkills: Array<{
      name: string;
      description?: string;
      difficulty: string;
    }>,
  ): Promise<CareerRoadmap> {
    try {
      const weakAreasStr =
        assessmentData.weakAreas.length > 0
          ? assessmentData.weakAreas.join(', ')
          : 'None identified';
      const strengthsStr =
        assessmentData.strengths.length > 0
          ? assessmentData.strengths.join(', ')
          : 'Assessment in progress';

      const skillsList = availableSkills
        .map(
          (s) =>
            `- ${s.name} (${s.difficulty})${s.description ? ': ' + s.description : ''}`,
        )
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
            content:
              'You are a career development expert specializing in creating personalized learning roadmaps. Provide realistic, actionable learning paths based on assessment results and career goals. Always return valid JSON.',
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

      // Parse JSON response
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        // Sometimes Groq returns JSON wrapped in markdown code blocks
        const jsonMatch =
          content.match(/```json\s*([\s\S]*?)\s*```/) ||
          content.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse JSON response from Groq');
        }
      }

      const response = parsed as GroqRoadmapResponse;

      // Validate and sanitize response
      if (!response.skills || !Array.isArray(response.skills)) {
        throw new Error('Invalid roadmap response: missing skills array');
      }

      const validPriorities: RoadmapSkill['priority'][] = [
        'high',
        'medium',
        'low',
      ];

      const sanitizedSkills: RoadmapSkill[] = response.skills
        .map((skill) => {
          // Parse estimatedWeeks
          const weeks =
            typeof skill.estimatedWeeks === 'number'
              ? skill.estimatedWeeks
              : typeof skill.estimatedWeeks === 'string'
                ? parseInt(skill.estimatedWeeks, 10)
                : 1;

          // Parse resources array
          let resources: string[] = [];
          if (Array.isArray(skill.resources)) {
            resources = skill.resources.map(String);
          } else if (typeof skill.resources === 'string') {
            try {
              const parsed: unknown = JSON.parse(skill.resources);
              resources = Array.isArray(parsed) ? parsed.map(String) : [];
            } catch {
              resources = [];
            }
          }

          // Parse milestones array
          let milestones: string[] = [];
          if (Array.isArray(skill.milestones)) {
            milestones = skill.milestones.map(String);
          } else if (typeof skill.milestones === 'string') {
            try {
              const parsed: unknown = JSON.parse(skill.milestones);
              milestones = Array.isArray(parsed) ? parsed.map(String) : [];
            } catch {
              milestones = [];
            }
          }

          // Parse prerequisites array
          let prerequisites: string[] = [];
          if (Array.isArray(skill.prerequisites)) {
            prerequisites = skill.prerequisites.map(String);
          } else if (typeof skill.prerequisites === 'string') {
            try {
              const parsed: unknown = JSON.parse(skill.prerequisites);
              prerequisites = Array.isArray(parsed) ? parsed.map(String) : [];
            } catch {
              prerequisites = [];
            }
          }

          const priority = skill.priority || 'medium';

          return {
            skillName: String(skill.skillName || '').trim(),
            estimatedWeeks: isNaN(weeks) ? 1 : Math.max(1, weeks),
            priority: validPriorities.includes(
              priority as RoadmapSkill['priority'],
            )
              ? (priority as RoadmapSkill['priority'])
              : 'medium',
            resources: resources.filter((r) => r.trim().length > 0),
            milestones: milestones.filter((m) => m.trim().length > 0),
            prerequisites: prerequisites.filter((p) => p.trim().length > 0),
          };
        })
        .filter(
          (skill) =>
            skill.skillName &&
            skill.estimatedWeeks > 0 &&
            skill.resources.length > 0 &&
            skill.milestones.length > 0,
        );

      if (sanitizedSkills.length === 0) {
        throw new Error('No valid skills in roadmap response');
      }

      // Calculate total weeks
      const totalWeeks = sanitizedSkills.reduce(
        (sum, skill) => sum + skill.estimatedWeeks,
        0,
      );

      const totalEstimatedWeeks =
        typeof response.totalEstimatedWeeks === 'number'
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
        recommendations: String(
          response.recommendations || 'Focus on building a strong foundation.',
        ).trim(),
      };
    } catch (error) {
      this.logger.error('Error generating career roadmap:', error);
      throw new Error('Failed to generate career roadmap');
    }
  }

  /**
   * Generate upskilling suggestions for current role
   * Returns advancement roles (similar to career-transitions but focused on advancement)
   */
  async suggestUpskilling(
    currentRole: string,
  ): Promise<CareerTransition[]> {
    try {
      const prompt = `Given the current career role: "${currentRole}", suggest exactly 4 advancement roles that someone in this position can progress to within their career path. These should be natural next steps for career growth and upskilling.

For each advancement role, provide:
- role: The target advancement role name (e.g., "Senior Software Engineer", "Lead Developer", "Principal Engineer")
- description: A brief explanation of what this advancement involves and how it differs from the current role (1-2 sentences)
- transitionDifficulty: One of "Easy", "Medium", or "Hard" based on how difficult the advancement would be
- commonSkills: An array of 3-5 key skills or competencies needed to advance to this role

Focus on roles that represent:
1. Vertical advancement (senior, lead, principal levels)
2. Specialized advancement (becoming an expert in a specific area)
3. Leadership advancement (team lead, tech lead, manager roles)
4. Strategic advancement (architect, consultant, advisor roles)

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

Make sure to provide exactly 4 diverse advancement options that represent realistic career progression paths.`;

      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a career counselor expert specializing in career advancement and upskilling within tech roles. Provide realistic, actionable advancement role suggestions based on the current role. Always return valid JSON with exactly 4 advancement roles.',
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

      // Parse JSON response
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        this.logger.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from Groq');
      }

      interface RawTransition {
        role?: string;
        description?: string;
        transitionDifficulty?: string;
        commonSkills?: unknown[];
      }

      interface ParsedResponse {
        transitions?: RawTransition[];
      }

      const response = parsed as ParsedResponse;

      if (
        !response ||
        !response.transitions ||
        !Array.isArray(response.transitions)
      ) {
        throw new Error('Invalid response structure from Groq');
      }

      const validDifficulties: Array<'Easy' | 'Medium' | 'Hard'> = [
        'Easy',
        'Medium',
        'Hard',
      ];

      // Sanitize and validate transitions
      const sanitizedTransitions = response.transitions
        .map((transition) => {
          const role = transition.role || '';
          const description = transition.description || '';
          const difficulty = transition.transitionDifficulty || 'Medium';

          // Parse commonSkills array
          let commonSkills: string[] = [];
          if (Array.isArray(transition.commonSkills)) {
            commonSkills = transition.commonSkills
              .map(String)
              .filter((s) => s.trim().length > 0);
          }

          return {
            role: role.trim(),
            description: description.trim(),
            transitionDifficulty: validDifficulties.includes(
              difficulty as 'Easy' | 'Medium' | 'Hard',
            )
              ? (difficulty as 'Easy' | 'Medium' | 'Hard')
              : 'Medium',
            commonSkills: commonSkills.length > 0 ? commonSkills : [],
          };
        })
        .filter(
          (transition) =>
            transition.role &&
            transition.description &&
            transition.commonSkills.length > 0,
        );

      if (sanitizedTransitions.length === 0) {
        throw new Error('No valid advancement roles in response');
      }

      // Ensure we return exactly 4 (or as many as available)
      return sanitizedTransitions.slice(0, 4);
    } catch (error) {
      this.logger.error('Error generating upskilling suggestions:', error);
      throw new Error('Failed to generate upskilling suggestions');
    }
  }
}
