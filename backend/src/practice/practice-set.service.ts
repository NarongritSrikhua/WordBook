import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeSet } from './entities/practice-set.entity';
import { PracticeQuestion } from './entities/practice.entity';
import { CreatePracticeSetDto } from './dto/create-practice-set.dto';
import { UpdatePracticeSetDto } from './dto/update-practice-set.dto';

@Injectable()
export class PracticeSetService {
  constructor(
    @InjectRepository(PracticeSet)
    private practiceSetRepository: Repository<PracticeSet>,
    @InjectRepository(PracticeQuestion)
    private practiceQuestionRepository: Repository<PracticeQuestion>,
  ) {}

  async create(createPracticeSetDto: CreatePracticeSetDto): Promise<PracticeSet> {
    const practiceSet = this.practiceSetRepository.create(createPracticeSetDto);
    return this.practiceSetRepository.save(practiceSet);
  }

  async findAll(): Promise<PracticeSet[]> {
    return this.practiceSetRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<PracticeSet> {
    const practiceSet = await this.practiceSetRepository.findOne({ where: { id } });
    if (!practiceSet) {
      throw new NotFoundException(`Practice set with ID ${id} not found`);
    }
    return practiceSet;
  }

  async findOneWithQuestions(id: string): Promise<PracticeSet & { questions: PracticeQuestion[] }> {
    const practiceSet = await this.findOne(id);
    
    // Get all questions for this set
    const questions = await this.practiceQuestionRepository.findByIds(practiceSet.questionIds);
    
    return {
      ...practiceSet,
      questions,
    };
  }

  async update(id: string, updatePracticeSetDto: UpdatePracticeSetDto): Promise<PracticeSet> {
    const practiceSet = await this.findOne(id);
    
    // Update the practice set with the new data
    Object.assign(practiceSet, updatePracticeSetDto);
    
    return this.practiceSetRepository.save(practiceSet);
  }

  async remove(id: string): Promise<void> {
    const result = await this.practiceSetRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Practice set with ID ${id} not found`);
    }
  }
}