import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { PracticeQuestion } from './entities/practice.entity';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';

@Injectable()
export class PracticeService {
  private readonly logger = new Logger(PracticeService.name);

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

  async getRandomQuestions(count: number = 10, category?: string): Promise<PracticeQuestion[]> {
    try {
      console.log(`[Service] Getting ${count} random questions${category ? ` in category '${category}'` : ''}`);
      
      // Build the query
      let query: any = {};
      if (category) {
        query.category = category;
      }
      
      // First try to get questions matching the exact category
      let questions = await this.practiceRepository.find({
        where: query,
        order: { id: 'DESC' }
      });
      
      // If we don't have enough questions with the exact category, we need to get more
      if (category && questions.length < count) {
        console.log(`[Service] Only found ${questions.length} questions in category '${category}', need ${count}`);
        
        // Get questions without category filter to fill the gap
        const remainingCount = count - questions.length;
        const additionalQuestions = await this.practiceRepository.find({
          where: { category: Not(Equal(category)) },
          order: { id: 'DESC' },
          take: remainingCount
        });
        
        console.log(`[Service] Adding ${additionalQuestions.length} questions from other categories`);
        questions = [...questions, ...additionalQuestions];
      }
      
      // Shuffle the questions
      questions = this.shuffleArray(questions);
      
      // Take only the requested count
      questions = questions.slice(0, count);
      
      console.log(`[Service] Returning ${questions.length} random questions`);
      if (category) {
        const matchingCategory = questions.filter(q => q.category === category).length;
        console.log(`[Service] ${matchingCategory} questions match the requested category '${category}'`);
      }
      
      return questions;
    } catch (error) {
      this.logger.error('Failed to get random questions', error.stack);
      throw new InternalServerErrorException('Failed to get random questions');
    }
  }

  // Helper method to shuffle an array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async getCategories(): Promise<string[]> {
    try {
      // Get all questions
      const questions = await this.practiceRepository.find();
      
      // Extract unique categories
      const categories = [...new Set(questions
        .map(question => question.category)
        .filter(category => category && category.trim() !== '')
      )];
      
      return categories;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }
}


