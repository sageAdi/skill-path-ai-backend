import { defineStore } from 'pinia';
export const useAssessmentStore = defineStore('assessment', {
    state: () => ({
        currentAssessment: null,
        answers: {},
        isSubmitting: false,
    }),
    getters: {
        questions: (state) => {
            return state.currentAssessment?.questions || [];
        },
        answeredCount: (state) => {
            return Object.keys(state.answers).length;
        },
        totalQuestions: (state) => {
            return state.currentAssessment?.questions.length || 0;
        },
        isComplete: (state) => {
            const total = state.currentAssessment?.questions.length || 0;
            return total > 0 && Object.keys(state.answers).length === total;
        },
    },
    actions: {
        setAssessment(assessment) {
            this.currentAssessment = assessment;
            this.answers = {};
        },
        setAnswer(questionId, selectedAnswer) {
            this.answers[questionId] = selectedAnswer;
        },
        clearAssessment() {
            this.currentAssessment = null;
            this.answers = {};
            this.isSubmitting = false;
        },
        setSubmitting(isSubmitting) {
            this.isSubmitting = isSubmitting;
        },
    },
});
//# sourceMappingURL=assessment.js.map