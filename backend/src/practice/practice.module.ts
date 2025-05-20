import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';
import { PracticeQuestion } from './entities/practice.entity';
import { PracticeSet } from './entities/practice-set.entity';
import { PracticeSetService } from './practice-set.service';
import { PracticeSetController } from './practice-set.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeQuestion, PracticeSet])],
  controllers: [PracticeController, PracticeSetController],
  providers: [PracticeService, PracticeSetService],
  exports: [PracticeService, PracticeSetService],
})
export class PracticeModule {}
