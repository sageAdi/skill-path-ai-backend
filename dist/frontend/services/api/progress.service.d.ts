import type { Progress, ProgressSummary, UpdateProgressDto } from '~/services/types';
export declare const progressService: {
    getProgressSummary(): Promise<ProgressSummary>;
    getProgressBySkill(skillId: string): Promise<Progress>;
    updateProgress(updateProgressDto: UpdateProgressDto): Promise<Progress>;
};
