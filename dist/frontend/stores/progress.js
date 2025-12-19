import { defineStore } from 'pinia';
export const useProgressStore = defineStore('progress', {
    state: () => ({
        progressBySkill: {},
        summary: null,
        isLoading: false,
    }),
    getters: {
        getSkillProgress: (state) => {
            return (skillId) => {
                return state.progressBySkill[skillId] || null;
            };
        },
        overallCompletion: (state) => {
            if (!state.summary || state.summary.totalSkills === 0)
                return 0;
            return Math.round((state.summary.completed / state.summary.totalSkills) * 100);
        },
    },
    actions: {
        setProgressForSkill(skillId, progress) {
            this.progressBySkill[skillId] = progress;
        },
        setSummary(summary) {
            this.summary = summary;
        },
        setLoading(isLoading) {
            this.isLoading = isLoading;
        },
    },
});
//# sourceMappingURL=progress.js.map