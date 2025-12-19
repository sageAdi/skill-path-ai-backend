import type { Assessment } from '~/services/types';
export declare const useAssessmentStore: import("pinia").StoreDefinition<"assessment", {
    currentAssessment: Assessment | null;
    answers: Record<string, number>;
    isSubmitting: boolean;
}, {
    questions: (state: {
        currentAssessment: Assessment | null;
        answers: Record<string, number>;
        isSubmitting: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        currentAssessment: Assessment | null;
        answers: Record<string, number>;
        isSubmitting: boolean;
    }>) => Assessment["questions"];
    answeredCount: (state: {
        currentAssessment: Assessment | null;
        answers: Record<string, number>;
        isSubmitting: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        currentAssessment: Assessment | null;
        answers: Record<string, number>;
        isSubmitting: boolean;
    }>) => number;
    totalQuestions: (state: {
        currentAssessment: Assessment | null;
        answers: Record<string, number>;
        isSubmitting: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        currentAssessment: Assessment | null;
        answers: Record<string, number>;
        isSubmitting: boolean;
    }>) => number;
    isComplete: (state: {
        currentAssessment: Assessment | null;
        answers: Record<string, number>;
        isSubmitting: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        currentAssessment: Assessment | null;
        answers: Record<string, number>;
        isSubmitting: boolean;
    }>) => boolean;
}, {
    setAssessment(assessment: Assessment | null): void;
    setAnswer(questionId: string, selectedAnswer: number): void;
    clearAssessment(): void;
    setSubmitting(isSubmitting: boolean): void;
}>;
