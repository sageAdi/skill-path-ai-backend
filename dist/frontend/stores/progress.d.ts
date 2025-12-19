import type { Progress, ProgressSummary } from '~/services/types';
export declare const useProgressStore: import("pinia").StoreDefinition<"progress", {
    progressBySkill: Record<string, Progress>;
    summary: ProgressSummary | null;
    isLoading: boolean;
}, {
    getSkillProgress: (state: {
        progressBySkill: Record<string, Progress>;
        summary: ProgressSummary | null;
        isLoading: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        progressBySkill: Record<string, Progress>;
        summary: ProgressSummary | null;
        isLoading: boolean;
    }>) => (skillId: string) => Progress | null;
    overallCompletion: (state: {
        progressBySkill: Record<string, Progress>;
        summary: ProgressSummary | null;
        isLoading: boolean;
    } & import("pinia").PiniaCustomStateProperties<{
        progressBySkill: Record<string, Progress>;
        summary: ProgressSummary | null;
        isLoading: boolean;
    }>) => number;
}, {
    setProgressForSkill(skillId: string, progress: Progress): void;
    setSummary(summary: ProgressSummary | null): void;
    setLoading(isLoading: boolean): void;
}>;
