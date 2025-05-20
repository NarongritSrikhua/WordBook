import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeQuestion } from './entities/practice.entity';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';

@Injectable()
export class PracticeService {
  constructor(
    @InjectRepository(PracticeQuestion)
    private practiceRepository: Repository<PracticeQuestion>,
  ) {}

  async create(createPracticeDto: CreatePracticeDto): Promise<PracticeQuestion> {
    const question = this.practiceRepository.create(createPracticeDto);
    return this.practiceRepository.save(question);
  }

  async findAll(): Promise<PracticeQuestion[]> {
    return this.practiceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<PracticeQuestion> {
    const question = await this.practiceRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Practice question with ID ${id} not found`);
    }
    return question;
  }

  async update(id: string, updatePracticeDto: UpdatePracticeDto): Promise<PracticeQuestion> {
    const question = await this.findOne(id);
    
    // Update the question with the new data
    Object.assign(question, updatePracticeDto);
    
    return this.practiceRepository.save(question);
  }

  async remove(id: string): Promise<void> {
    const result = await this.practiceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Practice question with ID ${id} not found`);
    }
  }

  async getRandomQuestions(count: number = 10): Promise<PracticeQuestion[]> {
    // Get random questions for practice sessions
    const questions = await this.practiceRepository
      .createQueryBuilder('question')
      .orderBy('RANDOM()')
      .take(count)
      .getMany();
    
    return questions;
  }
}
