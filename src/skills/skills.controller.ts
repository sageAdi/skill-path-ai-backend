import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.skillsService.remove(id);
  }

  @Post(':id/prerequisites/:prerequisiteId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  addPrerequisite(
    @Param('id') id: string,
    @Param('prerequisiteId') prerequisiteId: string,
  ) {
    return this.skillsService.addPrerequisite(id, prerequisiteId);
  }

  @Delete(':id/prerequisites/:prerequisiteId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  removePrerequisite(
    @Param('id') id: string,
    @Param('prerequisiteId') prerequisiteId: string,
  ) {
    return this.skillsService.removePrerequisite(id, prerequisiteId);
  }
}
