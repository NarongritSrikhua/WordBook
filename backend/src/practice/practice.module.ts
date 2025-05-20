import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';
import { PracticeQuestion } from './entities/practice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeQuestion])],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}