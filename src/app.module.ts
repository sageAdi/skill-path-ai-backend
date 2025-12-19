import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssessmentModule } from './assessment/assessment.module';
import { LearningPathModule } from './learning-path/learning-path.module';
import { ProgressModule } from './progress/progress.module';
import { AIModule } from './ai/ai.module';
import { SkillsModule } from './skills/skills.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AssessmentModule,
    LearningPathModule,
    ProgressModule,
    AIModule,
    SkillsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
