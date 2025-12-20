// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import {
//   IAIProvider,
//   GeneratedQuestion,
//   PathAdjustmentSuggestion,
//   CareerTransition,
//   CareerRoadmap,
//   RoadmapSkill,
// } from '../interfaces/ai-provider.interface';

// // Type definitions for Ollama API responses
// interface OllamaGenerateResponse {
//   model: string;
//   created_at: string;
//   response: string;
//   done: boolean;
//   context?: number[];
//   total_duration?: number;
//   load_duration?: number;
//   prompt_eval_count?: number;
//   prompt_eval_duration?: number;
//   eval_count?: number;
//   eval_duration?: number;
// }

// interface OllamaQuestionResponse {
//   questions?: Array<{
//     question?: string;
//     options?: unknown[];
//     correctAnswerIndex?: number | string;
//     correctAnswer?: number | string;
//     explanation?: string;
//   }>;
// }

// interface OllamaSuggestionResponse {
//   suggestions?: Array<{
//     action?: string;
//     skillId?: string;
//     targetOrder?: number | string;
//     reason?: string;
//   }>;
// }

// interface OllamaCareerTransitionResponse {
//   transitions?: Array<{
//     role?: string;
//     description?: string;
//     transitionDifficulty?: string;
//     commonSkills?: unknown;
//   }>;
// }

// @Injectable()
// export class OllamaProvider implements IAIProvider {
//   private readonly logger = new Logger(OllamaProvider.name);
//   private readonly baseUrl: string;
//   private readonly model: string;

//   constructor(private configService: ConfigService) {
//     // Default to local Ollama instance
//     this.baseUrl =
//       this.configService.get<string>('OLLAMA_BASE_URL') ||
//       'http://localhost:11434';
//     this.model =
//       this.configService.get<string>('OLLAMA_MODEL') || 'llama3.2:3b';
//     this.logger.log(
//       `Ollama provider initialized with model: ${this.model} at ${this.baseUrl}`,
//     );
//   }

//   /**
//    * Make a request to Ollama API
//    */
//   private async ollamaRequest(
//     prompt: string,
//     systemPrompt: string,
//     jsonMode: boolean = false,
//   ): Promise<string> {
//     try {
//       const response = await fetch(`${this.baseUrl}/api/generate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: this.model,
//           prompt: `${systemPrompt}\n\n${prompt}`,
//           stream: false,
//           format: jsonMode ? 'json' : undefined,
//           options: {
//             temperature: 0.7,
//             ...(jsonMode && { response_format: { type: 'json_object' } }),
//           },
//         }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
//       }

//       const data = (await response.json()) as OllamaGenerateResponse;
//       return data.response || '';
//     } catch (error) {
//       this.logger.error('Ollama API request failed:', error);
//       throw error;
//     }
//   }

//   async generateQuestions(
//     context: string,
//     skillName?: string,
//     count: number = 5,
//   ): Promise<GeneratedQuestion[]> {
//     try {
//       const prompt = skillName
//         ? `Generate ${count} multiple-choice assessment questions about "${skillName}" for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`
//         : `Generate ${count} multiple-choice assessment questions for someone learning "${context}". Each question should have 4 options, with exactly one correct answer. Return the response as a JSON object with a "questions" array: {"questions": [{"question": "string", "options": ["option1", "option2", "option3", "option4"], "correctAnswerIndex": 0, "explanation": "brief explanation"}]}.`;

//       const systemPrompt =
//         'You are an expert educational assessment creator. Generate clear, well-structured multiple-choice questions. Always return valid JSON.';

//       const content = await this.ollamaRequest(prompt, systemPrompt, true);

//       if (!content) {
//         throw new Error('Empty response from Ollama');
//       }

//       // Parse JSON response
//       let parsed: unknown;
//       try {
//         parsed = JSON.parse(content);
//       } catch {
//         // Sometimes Ollama returns JSON wrapped in markdown code blocks
//         const jsonMatch =
//           content.match(/```json\s*([\s\S]*?)\s*```/) ||
//           content.match(/```\s*([\s\S]*?)\s*```/);
//         if (jsonMatch) {
//           parsed = JSON.parse(jsonMatch[1]);
//         } else {
//           throw new Error('Failed to parse JSON response from Ollama');
//         }
//       }

//       const response = parsed as OllamaQuestionResponse;
//       const questions = Array.isArray(parsed)
//         ? parsed
//         : response.questions || [];

//       // Validate and sanitize questions
//       return questions
//         .slice(0, count)
//         .map((q) => {
//           const qObj = q as {
//             question?: string;
//             options?: unknown[];
//             correctAnswerIndex?: unknown;
//             correctAnswer?: unknown;
//             explanation?: string;
//           };
//           const answerIndex = qObj.correctAnswerIndex ?? qObj.correctAnswer;
//           const answerIndexStr =
//             typeof answerIndex === 'string' || typeof answerIndex === 'number'
//               ? String(answerIndex)
//               : '0';
//           return {
//             question: String(qObj.question || '').trim(),
//             options: Array.isArray(qObj.options)
//               ? qObj.options.map(String)
//               : [],
//             correctAnswerIndex: parseInt(answerIndexStr, 10),
//             explanation: qObj.explanation
//               ? String(qObj.explanation).trim()
//               : undefined,
//           };
//         })
//         .filter(
//           (q) =>
//             q.question &&
//             q.options.length === 4 &&
//             q.correctAnswerIndex >= 0 &&
//             q.correctAnswerIndex < 4,
//         );
//     } catch (error) {
//       this.logger.error('Error generating questions:', error);
//       throw new Error('Failed to generate assessment questions');
//     }
//   }

//   async explainAnswer(
//     question: string,
//     userAnswer: string,
//     correctAnswer: string,
//   ): Promise<string> {
//     try {
//       const prompt = `The user answered "${userAnswer}" to the question: "${question}". The correct answer is "${correctAnswer}". Provide a clear, educational explanation of why the correct answer is correct and what the user might have misunderstood. Keep it concise (2-3 sentences).`;

//       const systemPrompt =
//         'You are a helpful educational tutor explaining answers to learners.';

//       const explanation = await this.ollamaRequest(prompt, systemPrompt, false);
//       return (
//         explanation.trim() ||
//         'The correct answer is the best choice based on the question requirements.'
//       );
//     } catch (error) {
//       this.logger.error('Error explaining answer:', error);
//       return 'Unable to generate explanation at this time.';
//     }
//   }

//   async suggestPathAdjustments(
//     progressData: Array<{
//       skillId: string;
//       skillName: string;
//       score: number;
//       attempts: number;
//     }>,
//     currentPath: Array<{ skillId: string; skillName: string; order: number }>,
//   ): Promise<PathAdjustmentSuggestion[]> {
//     try {
//       const progressSummary = progressData
//         .map((p) => `${p.skillName}: Score ${p.score}%, ${p.attempts} attempts`)
//         .join('\n');

//       const pathSummary = currentPath
//         .map((p) => `${p.order}. ${p.skillName}`)
//         .join('\n');

//       const prompt = `Based on this learning progress:
// ${progressSummary}

// And current learning path:
// ${pathSummary}

// Suggest learning path adjustments. Return JSON object with "suggestions" array: {"suggestions": [{"action": "INSERT_REVISION"|"INSERT_MICRO_PRACTICE"|"SKIP_SKILL"|"REORDER", "skillId": "uuid or null", "targetOrder": number or null, "reason": "explanation"}]}. Only suggest if there are clear learning gaps or issues.`;

//       const systemPrompt =
//         'You are an adaptive learning system that suggests learning path improvements based on student performance. Always return valid JSON.';

//       const content = await this.ollamaRequest(prompt, systemPrompt, true);

//       if (!content) {
//         return [];
//       }

//       // Parse JSON response
//       let parsed: unknown;
//       try {
//         parsed = JSON.parse(content);
//       } catch {
//         // Sometimes Ollama returns JSON wrapped in markdown code blocks
//         const jsonMatch =
//           content.match(/```json\s*([\s\S]*?)\s*```/) ||
//           content.match(/```\s*([\s\S]*?)\s*```/);
//         if (jsonMatch) {
//           parsed = JSON.parse(jsonMatch[1]);
//         } else {
//           this.logger.warn(
//             'Failed to parse suggestions JSON, returning empty array',
//           );
//           return [];
//         }
//       }

//       const response = parsed as OllamaSuggestionResponse;
//       const suggestions = Array.isArray(parsed)
//         ? parsed
//         : response.suggestions || [];

//       const validActions: PathAdjustmentSuggestion['action'][] = [
//         'INSERT_REVISION',
//         'INSERT_MICRO_PRACTICE',
//         'SKIP_SKILL',
//         'REORDER',
//       ];

//       return suggestions
//         .map((s) => {
//           const sObj = s as {
//             action?: string;
//             skillId?: string;
//             targetOrder?: unknown;
//             reason?: string;
//           };
//           const action = sObj.action || 'REORDER';
//           const targetOrderValue =
//             sObj.targetOrder !== undefined &&
//             (typeof sObj.targetOrder === 'string' ||
//               typeof sObj.targetOrder === 'number')
//               ? parseInt(String(sObj.targetOrder), 10)
//               : undefined;
//           return {
//             action: validActions.includes(
//               action as PathAdjustmentSuggestion['action'],
//             )
//               ? (action as PathAdjustmentSuggestion['action'])
//               : 'REORDER',
//             skillId: sObj.skillId || undefined,
//             targetOrder: targetOrderValue,
//             reason: String(sObj.reason || 'AI-suggested adjustment'),
//           };
//         })
//         .filter((s) => validActions.includes(s.action));
//     } catch (error) {
//       this.logger.error('Error suggesting path adjustments:', error);
//       return [];
//     }
//   }

//   async suggestCareerTransitions(
//     currentRole: string,
//   ): Promise<CareerTransition[]> {
//     try {
//       const prompt = `Given the current career role: "${currentRole}", suggest exactly 4 career transition options that would be realistic and valuable for someone in this role.

// For each transition, provide:
// - role: The target career role name
// - description: A brief explanation of what this transition involves (1-2 sentences)
// - transitionDifficulty: One of "Easy", "Medium", or "Hard" based on how difficult the transition would be
// - commonSkills: An array of 3-5 key skills or technologies needed for this transition

// Return the response as a JSON object with a "transitions" array:
// {
//   "transitions": [
//     {
//       "role": "Role Name",
//       "description": "Brief description",
//       "transitionDifficulty": "Easy|Medium|Hard",
//       "commonSkills": ["Skill1", "Skill2", "Skill3"]
//     }
//   ]
// }

// Make sure to provide exactly 4 diverse transition options that cover different career directions (e.g., technical advancement, lateral moves, specialization, leadership).`;

//       const systemPrompt =
//         'You are a career counselor expert specializing in tech career transitions. Provide realistic, actionable career transition suggestions based on the current role. Always return valid JSON with exactly 4 transitions.';

//       const content = await this.ollamaRequest(prompt, systemPrompt, true);

//       if (!content) {
//         throw new Error('Empty response from Ollama');
//       }

//       // Parse JSON response
//       let parsed: unknown;
//       try {
//         parsed = JSON.parse(content);
//       } catch {
//         // Sometimes Ollama returns JSON wrapped in markdown code blocks
//         const jsonMatch =
//           content.match(/```json\s*([\s\S]*?)\s*```/) ||
//           content.match(/```\s*([\s\S]*?)\s*```/);
//         if (jsonMatch) {
//           parsed = JSON.parse(jsonMatch[1]);
//         } else {
//           throw new Error('Failed to parse JSON response from Ollama');
//         }
//       }

//       const response = parsed as OllamaCareerTransitionResponse;
//       const transitions = Array.isArray(parsed)
//         ? parsed
//         : response.transitions || [];

//       // Validate and sanitize transitions
//       const validDifficulties: CareerTransition['transitionDifficulty'][] = [
//         'Easy',
//         'Medium',
//         'Hard',
//       ];

//       const sanitized = transitions
//         .slice(0, 4)
//         .map((t) => {
//           const tObj = t as {
//             role?: string;
//             description?: string;
//             transitionDifficulty?: string;
//             commonSkills?: unknown;
//           };

//           // Handle commonSkills - could be array or string
//           let skills: string[] = [];
//           if (Array.isArray(tObj.commonSkills)) {
//             skills = tObj.commonSkills.map(String);
//           } else if (typeof tObj.commonSkills === 'string') {
//             // Try to parse if it's a JSON string
//             try {
//               // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//               const parsed = JSON.parse(tObj.commonSkills);
//               skills = Array.isArray(parsed)
//                 ? (parsed as unknown[]).map(String)
//                 : [String(tObj.commonSkills)];
//             } catch {
//               skills = [String(tObj.commonSkills)];
//             }
//           }

//           const difficulty = tObj.transitionDifficulty || 'Medium';
//           return {
//             role: String(tObj.role || 'Unknown Role').trim(),
//             description: String(tObj.description || '').trim(),
//             transitionDifficulty: validDifficulties.includes(
//               difficulty as CareerTransition['transitionDifficulty'],
//             )
//               ? (difficulty as CareerTransition['transitionDifficulty'])
//               : 'Medium',
//             commonSkills: skills.filter((s) => s.trim().length > 0),
//           };
//         })
//         .filter(
//           (t) =>
//             t.role &&
//             t.role !== 'Unknown Role' &&
//             t.description &&
//             t.commonSkills.length > 0,
//         );

//       // Ensure we have exactly 4 transitions
//       if (sanitized.length < 4) {
//         this.logger.warn(
//           `Only received ${sanitized.length} valid transitions, expected 4`,
//         );
//       }

//       return sanitized.slice(0, 4);
//     } catch (error) {
//       this.logger.error('Error generating career transitions:', error);
//       throw new Error('Failed to generate career transition suggestions');
//     }
//   }

//   async generateCareerRoadmap(
//     assessmentData: {
//       score: number;
//       totalQuestions: number;
//       correctAnswers: number;
//       weakAreas: string[];
//       strengths: string[];
//     },
//     targetRole: string,
//     availableSkills: Array<{
//       name: string;
//       description?: string;
//       difficulty: string;
//     }>,
//   ): Promise<CareerRoadmap> {
//     try {
//       const weakAreasStr =
//         assessmentData.weakAreas.length > 0
//           ? assessmentData.weakAreas.join(', ')
//           : 'None identified';
//       const strengthsStr =
//         assessmentData.strengths.length > 0
//           ? assessmentData.strengths.join(', ')
//           : 'Assessment in progress';

//       const skillsList = availableSkills
//         .map(
//           (s) =>
//             `- ${s.name} (${s.difficulty})${s.description ? ': ' + s.description : ''}`,
//         )
//         .join('\n');

//       const prompt = `You are a career development expert. Generate a comprehensive learning roadmap.

// Current Assessment Results:
// - Score: ${assessmentData.score}%
// - Correct: ${assessmentData.correctAnswers}/${assessmentData.totalQuestions}
// - Weak Areas: ${weakAreasStr}
// - Strengths: ${strengthsStr}

// Target Role: ${targetRole}

// Available Skills to choose from:
// ${skillsList}

// Generate a personalized learning roadmap with:
// 1. Select 8-12 relevant skills from the available list
// 2. Order them logically (prerequisites first)
// 3. Estimate learning time in weeks for each
// 4. Assign priority (high/medium/low)
// 5. Suggest 2-3 learning resources per skill WITH ACTUAL URLs
// 6. Define 2-3 milestones per skill
// 7. Overall recommendations

// IMPORTANT: For resources, provide actual URLs in format "Resource Name - https://example.com/path"

// Return JSON format:
// {
//   "targetRole": "${targetRole}",
//   "totalEstimatedWeeks": <number>,
//   "skills": [
//     {
//       "skillName": "<exact name>",
//       "estimatedWeeks": <number>,
//       "priority": "high" | "medium" | "low",
//       "resources": [
//         "MDN Docs - https://developer.mozilla.org/",
//         "Tutorial - https://example.com"
//       ],
//       "milestones": ["<milestone 1>", "<milestone 2>"],
//       "prerequisites": []
//     }
//   ],
//   "recommendations": "<text>"
// }`;

//       const response = await fetch(`${this.baseUrl}/api/generate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: this.model,
//           prompt: `System: You are a career development expert. Always return valid JSON.\n\nUser: ${prompt}`,
//           stream: false,
//           format: 'json',
//           options: {
//             temperature: 0.7,
//           },
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Ollama API error: ${response.statusText}`);
//       }

//       const data = (await response.json()) as { response?: string };
//       const content = data.response;

//       if (!content) {
//         throw new Error('Empty response from Ollama');
//       }

//       let parsed: unknown;
//       try {
//         parsed = JSON.parse(content);
//       } catch {
//         const jsonMatch =
//           content.match(/```json\s*([\s\S]*?)\s*```/) ||
//           content.match(/```\s*([\s\S]*?)\s*```/);
//         if (jsonMatch) {
//           parsed = JSON.parse(jsonMatch[1]);
//         } else {
//           throw new Error('Failed to parse JSON response');
//         }
//       }

//       const roadmapResponse = parsed as {
//         targetRole?: string;
//         totalEstimatedWeeks?: number | string;
//         skills?: Array<{
//           skillName?: string;
//           estimatedWeeks?: number | string;
//           priority?: string;
//           resources?: unknown;
//           milestones?: unknown;
//           prerequisites?: unknown;
//         }>;
//         recommendations?: string;
//       };

//       if (!roadmapResponse.skills || !Array.isArray(roadmapResponse.skills)) {
//         throw new Error('Invalid roadmap response: missing skills array');
//       }

//       const validPriorities: RoadmapSkill['priority'][] = [
//         'high',
//         'medium',
//         'low',
//       ];

//       const sanitizedSkills = roadmapResponse.skills
//         .map((skill) => {
//           const weeks =
//             typeof skill.estimatedWeeks === 'number'
//               ? skill.estimatedWeeks
//               : typeof skill.estimatedWeeks === 'string'
//                 ? parseInt(skill.estimatedWeeks, 10)
//                 : 1;

//           let resources: string[] = [];
//           if (Array.isArray(skill.resources)) {
//             resources = (skill.resources as unknown[]).map(String);
//           }

//           let milestones: string[] = [];
//           if (Array.isArray(skill.milestones)) {
//             milestones = (skill.milestones as unknown[]).map(String);
//           }

//           let prerequisites: string[] = [];
//           if (Array.isArray(skill.prerequisites)) {
//             prerequisites = (skill.prerequisites as unknown[]).map(String);
//           }

//           const priority = skill.priority || 'medium';

//           return {
//             skillName: String(skill.skillName || '').trim(),
//             estimatedWeeks: isNaN(weeks) ? 1 : Math.max(1, weeks),
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//             priority: validPriorities.includes(
//               priority as RoadmapSkill['priority'],
//             )
//               ? (priority as RoadmapSkill['priority'])
//               : 'medium',
//             resources: resources.filter((r) => r.trim().length > 0),
//             milestones: milestones.filter((m) => m.trim().length > 0),
//             prerequisites: prerequisites.filter((p) => p.trim().length > 0),
//           };
//         })
//         .filter(
//           (skill: {
//             skillName: string;
//             estimatedWeeks: number;
//             resources: string[];
//             milestones: string[];
//           }) =>
//             skill.skillName &&
//             skill.estimatedWeeks > 0 &&
//             skill.resources.length > 0 &&
//             skill.milestones.length > 0,
//         ) as RoadmapSkill[];

//       if (sanitizedSkills.length === 0) {
//         throw new Error('No valid skills in roadmap response');
//       }

//       const totalWeeks = sanitizedSkills.reduce(
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
//         (sum: number, skill: RoadmapSkill) => sum + skill.estimatedWeeks,
//         0,
//       ) as number;

//       const totalEstimatedWeeks =
//         typeof roadmapResponse.totalEstimatedWeeks === 'number'
//           ? roadmapResponse.totalEstimatedWeeks
//           : typeof roadmapResponse.totalEstimatedWeeks === 'string'
//             ? parseInt(roadmapResponse.totalEstimatedWeeks, 10)
//             : totalWeeks;

//       return {
//         targetRole: String(roadmapResponse.targetRole || targetRole).trim(),
//         totalEstimatedWeeks: isNaN(totalEstimatedWeeks)
//           ? totalWeeks
//           : totalEstimatedWeeks,
//         skills: sanitizedSkills,
//         recommendations: String(
//           roadmapResponse.recommendations ||
//             'Focus on building a strong foundation.',
//         ).trim(),
//       };
//     } catch (error) {
//       this.logger.error('Error generating career roadmap:', error);
//       throw new Error('Failed to generate career roadmap');
//     }
//   }
// }
