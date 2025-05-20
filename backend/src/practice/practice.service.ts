import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { PracticeQuestion } from './entities/practice.entity';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';
import { SubmitPracticeResultDto } from './dto/submit-practice-result.dto';
import { PracticeHistory } from './entities/practice-history.entity';

@Injectable()
export class PracticeService {
  private readonly logger = new Logger(PracticeService.name);

  constructor(
    @InjectRepository(PracticeQuestion)
    private practiceRepository: Repository<PracticeQuestion>,
    @InjectRepository(PracticeHistory)
    private practiceHistoryRepository: Repository<PracticeHistory>,
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
    try {
      // Check if the id is 'random' and handle it specially
      if (id === 'random') {
        this.logger.warn('Attempted to find question with ID "random" - redirecting to random questions endpoint');
        const randomQuestions = await this.getRandomQuestions(1);
        if (randomQuestions.length > 0) {
          return randomQuestions[0];
        }
        throw new NotFoundException('No random questions available');
      }
      
      const question = await this.practiceRepository.findOne({ where: { id } });
      if (!question) {
        throw new NotFoundException(`Practice question with ID ${id} not found`);
      }
      return question;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding question with ID ${id}:`, error.stack);
      throw new InternalServerErrorException(`Failed to find question with ID ${id}`);
    }
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

  async getUserPracticeHistory(userId: string, forceRefresh: boolean = false): Promise<PracticeHistory[]> {
    try {
      this.logger.log(`[Service] Fetching practice history for user: ${userId} (force=${forceRefresh})`);
      
      // If userId is empty, return empty array
      if (!userId) {
        this.logger.warn('[Service] Empty userId provided, returning empty array');
        return [];
      }
      
      // Log the query we're about to execute
      this.logger.log(`[Service] Executing query: SELECT * FROM practice_history WHERE userId = '${userId}' ORDER BY completedAt DESC`);
      
      // Get real data from the database
      const history = await this.practiceHistoryRepository.find({
        where: { userId },
        order: { completedAt: 'DESC' }
      });
      
      this.logger.log(`[Service] Found ${history.length} practice history entries for user ${userId}`);
      
      // If no results and we're not forcing a refresh, try a case-insensitive search
      if (history.length === 0 && !forceRefresh) {
        this.logger.log(`[Service] No results found with exact match, trying case-insensitive search`);
        
        // Use raw query for case-insensitive search if your DB supports it
        // This is PostgreSQL syntax - adjust for your database
        const rawResults = await this.practiceHistoryRepository.query(
          `SELECT * FROM practice_history WHERE LOWER(userId) = LOWER($1) ORDER BY "completedAt" DESC`,
          [userId]
        );
        
        if (rawResults.length > 0) {
          this.logger.log(`[Service] Found ${rawResults.length} entries with case-insensitive search`);
          return rawResults;
        }
      }
      
      return history;
    } catch (error) {
      this.logger.error(`[Service] Error fetching user practice history: ${error.message}`, error.stack);
      throw error;
    }
  }

  async savePracticeResult(userId: string, resultDto: SubmitPracticeResultDto): Promise<PracticeHistory> {
    try {
      this.logger.log(`[Service] Saving practice result for user: ${userId}`);
      
      // Create new practice history entry
      const practiceHistory = this.practiceHistoryRepository.create({
        userId,
        category: resultDto.category,
        practiceSetId: resultDto.practiceSetId,
        totalQuestions: resultDto.totalQuestions,
        correctAnswers: resultDto.correctAnswers,
        score: resultDto.score,
        timeTaken: resultDto.timeTaken,
        completedAt: new Date()
      });
      
      // Save to database
      const savedResult = await this.practiceHistoryRepository.save(practiceHistory);
      
      this.logger.log(`[Service] Practice result saved with ID: ${savedResult.id}`);
      return savedResult;
    } catch (error) {
      this.logger.error(`[Service] Error saving practice result: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAllHistoryUserIds(): Promise<string[]> {
    try {
      this.logger.log('[Service] Getting all unique user IDs from practice history');
      
      // Use raw query to get distinct user IDs
      const result = await this.practiceHistoryRepository.query(
        'SELECT DISTINCT "userId" FROM practice_history ORDER BY "userId"'
      );
      
      const userIds = result.map(row => row.userId);
      this.logger.log(`[Service] Found ${userIds.length} unique user IDs`);
      
      // Log the first few IDs for debugging
      if (userIds.length > 0) {
        this.logger.log(`[Service] Sample user IDs: ${userIds.slice(0, 5).join(', ')}${userIds.length > 5 ? '...' : ''}`);
      }
      
      return userIds;
    } catch (error) {
      this.logger.error(`[Service] Error getting unique user IDs: ${error.message}`, error.stack);
      throw error;
    }
  }
}


