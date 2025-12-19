import type { Skill } from '~/services/types';
export declare const skillsService: {
    getAllSkills(): Promise<Skill[]>;
    getSkillById(id: string): Promise<Skill>;
};
