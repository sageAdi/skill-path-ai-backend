import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async create(createSkillDto: CreateSkillDto) {
    // Check if skill with same name already exists
    const existingSkill = await this.prisma.skill.findUnique({
      where: { name: createSkillDto.name },
    });

    if (existingSkill) {
      throw new ConflictException(
        `Skill with name "${createSkillDto.name}" already exists`,
      );
    }

    const skill = await this.prisma.skill.create({
      data: {
        name: createSkillDto.name,
        description: createSkillDto.description,
        difficulty: createSkillDto.difficulty,
        category: createSkillDto.category,
      },
    });

    return skill;
  }

  async findAll() {
    const skills = await this.prisma.skill.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        prerequisites: {
          include: {
            prerequisite: {
              select: {
                id: true,
                name: true,
                difficulty: true,
              },
            },
          },
        },
        dependents: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    return skills;
  }

  async findOne(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        prerequisites: {
          include: {
            prerequisite: {
              select: {
                id: true,
                name: true,
                difficulty: true,
                description: true,
              },
            },
          },
        },
        dependents: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                difficulty: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID "${id}" not found`);
    }

    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto) {
    // Check if skill exists
    const existingSkill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!existingSkill) {
      throw new NotFoundException(`Skill with ID "${id}" not found`);
    }

    // If name is being updated, check for conflicts
    if (updateSkillDto.name && updateSkillDto.name !== existingSkill.name) {
      const nameConflict = await this.prisma.skill.findUnique({
        where: { name: updateSkillDto.name },
      });

      if (nameConflict) {
        throw new ConflictException(
          `Skill with name "${updateSkillDto.name}" already exists`,
        );
      }
    }

    const updatedSkill = await this.prisma.skill.update({
      where: { id },
      data: {
        name: updateSkillDto.name,
        description: updateSkillDto.description,
        difficulty: updateSkillDto.difficulty,
        category: updateSkillDto.category,
      },
    });

    return updatedSkill;
  }

  async remove(id: string) {
    // Check if skill exists
    const existingSkill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!existingSkill) {
      throw new NotFoundException(`Skill with ID "${id}" not found`);
    }

    // Check if skill is being used in learning paths or assessments
    const [learningPathNodes, assessments] = await Promise.all([
      this.prisma.learningPathNode.findFirst({
        where: { skillId: id },
      }),

      this.prisma.assessment.findFirst({
        where: { skillId: id },
      }),
    ]);

    if (learningPathNodes || assessments) {
      throw new BadRequestException(
        'Cannot delete skill that is being used in learning paths or assessments',
      );
    }

    await this.prisma.skill.delete({
      where: { id },
    });

    return { message: 'Skill deleted successfully' };
  }

  async addPrerequisite(skillId: string, prerequisiteId: string) {
    if (skillId === prerequisiteId) {
      throw new BadRequestException(
        'A skill cannot be a prerequisite of itself',
      );
    }

    // Check if both skills exist
    const [skill, prerequisite] = await Promise.all([
      this.prisma.skill.findUnique({ where: { id: skillId } }),

      this.prisma.skill.findUnique({ where: { id: prerequisiteId } }),
    ]);

    if (!skill) {
      throw new NotFoundException(`Skill with ID "${skillId}" not found`);
    }

    if (!prerequisite) {
      throw new NotFoundException(
        `Prerequisite skill with ID "${prerequisiteId}" not found`,
      );
    }

    // Check if prerequisite already exists
    const existingPrerequisite = await this.prisma.skillPrerequisite.findUnique(
      {
        where: {
          skillId_prerequisiteId: {
            skillId,
            prerequisiteId,
          },
        },
      },
    );

    if (existingPrerequisite) {
      throw new ConflictException('Prerequisite relationship already exists');
    }

    const skillPrerequisite = await this.prisma.skillPrerequisite.create({
      data: {
        skillId,
        prerequisiteId,
      },
    });

    return skillPrerequisite;
  }

  async removePrerequisite(skillId: string, prerequisiteId: string) {
    const skillPrerequisite = await this.prisma.skillPrerequisite.findUnique({
      where: {
        skillId_prerequisiteId: {
          skillId,
          prerequisiteId,
        },
      },
    });

    if (!skillPrerequisite) {
      throw new NotFoundException('Prerequisite relationship not found');
    }

    await this.prisma.skillPrerequisite.delete({
      where: {
        skillId_prerequisiteId: {
          skillId,
          prerequisiteId,
        },
      },
    });

    return { message: 'Prerequisite removed successfully' };
  }
}
