import type { Assessment, AssessmentResult, AssessmentType, SubmitAssessmentDto } from '~/services/types';
export interface StartAssessmentDto {
    type: AssessmentType;
    skillId?: string;
}
export declare const assessmentService: {
    startAssessment(startAssessmentDto: StartAssessmentDto): Promise<Assessment>;
    submitAssessment(submitAssessmentDto: SubmitAssessmentDto): Promise<AssessmentResult>;
    getAssessment(id: string): Promise<Assessment>;
};
