import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard } from './entities/flashcard.entity';
import { Category } from './entities/category.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

interface FindAllOptions {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  userId?: string;
  search?: string;
  category?: string;
}

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(Flashcard)
    private flashcardsRepository: Repository<Flashcard>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createFlashcardDto: CreateFlashcardDto, userId: string): Promise<Flashcard> {
    console.log('Creating flashcard with DTO:', createFlashcardDto); // Add logging
    
    const flashcard = this.flashcardsRepository.create({
      ...createFlashcardDto,
      userId,
    });
    
    console.log('Flashcard entity before save:', flashcard); // Add logging
    return this.flashcardsRepository.save(flashcard);
  }

  //  userId เป็น optional
  async findAll(options: FindAllOptions = {}): Promise<{ items: Flashcard[]; totalItems: number; totalPages: number; currentPage: number }> {
    const { page = 1, limit = 10, sortField = 'updatedAt', sortOrder = 'DESC', userId, search, category } = options;
    
    const queryBuilder = this.flashcardsRepository.createQueryBuilder('flashcard');
    
    if (userId) {
      queryBuilder.where('flashcard.userId = :userId', { userId });
    }

    // Add search condition
    if (search) {
      queryBuilder.andWhere('(flashcard.front ILIKE :search OR flashcard.back ILIKE :search)', {
        search: `%${search}%`
      });
    }

    // Add category filter
    if (category) {
      queryBuilder.andWhere('flashcard.category = :category', { category });
    }
    
    // Add sorting
    queryBuilder.orderBy(`flashcard.${sortField}`, sortOrder);
    
    // Add pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    
    // Get total count
    const totalItems = await queryBuilder.getCount();
    
    // Get paginated results
    const items = await queryBuilder.getMany();
    
    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    };
  }

  async findOne(id: string, userId: string): Promise<Flashcard> {
    const flashcard = await this.flashcardsRepository.findOne({ 
      where: { id, userId } 
    });
    
    if (!flashcard) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }
    
    return flashcard;
  }

  async update(id: string, updateFlashcardDto: UpdateFlashcardDto, userId: string): Promise<Flashcard> {
    const flashcard = await this.findOne(id, userId);
    
    Object.assign(flashcard, updateFlashcardDto);
    
    return this.flashcardsRepository.save(flashcard);
  }

  async remove(id: string, userId: string): Promise<void> {
    const flashcard = await this.findOne(id, userId);
    
    await this.flashcardsRepository.remove(flashcard);
  }

  async review(id: string, reviewFlashcardDto: ReviewFlashcardDto, userId: string): Promise<Flashcard> {
    const flashcard = await this.findOne(id, userId);
    const now = new Date();
    let nextReviewDate = new Date();
    
    // Simple spaced repetition algorithm
    if (reviewFlashcardDto.isCorrect) {
      switch(flashcard.difficulty) {
        case 'easy':
          nextReviewDate.setDate(now.getDate() + 7); // Review in 7 days
          break;
        case 'medium':
          nextReviewDate.setDate(now.getDate() + 3); // Review in 3 days
          break;
        case 'hard':
          nextReviewDate.setDate(now.getDate() + 1); // Review tomorrow
          break;
      }
    } else {
      // If incorrect, review again soon
      nextReviewDate.setHours(now.getHours() + 4); // Review in 4 hours
    }
    
    flashcard.lastReviewed = now;
    flashcard.nextReview = nextReviewDate;
    
    return this.flashcardsRepository.save(flashcard);
  }

  async updateAsAdmin(id: string, updateFlashcardDto: UpdateFlashcardDto): Promise<Flashcard> {
    console.log(`Admin updating flashcard ${id} with data:`, updateFlashcardDto);
    
    const flashcard = await this.flashcardsRepository.findOne({ where: { id } });
    
    if (!flashcard) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }
    
    // Update the flashcard with new data
    Object.assign(flashcard, updateFlashcardDto);
    console.log('Flashcard after update:', flashcard);
    
    return this.flashcardsRepository.save(flashcard);
  }

  async removeAsAdmin(id: string): Promise<void> {
    console.log(`Admin removing flashcard ${id}`);
    
    const result = await this.flashcardsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Flashcard with ID ${id} not found`);
    }
    
    console.log(`Flashcard ${id} deleted successfully`);
  }

  // Category management methods
  async findAllCategories() {
    return this.categoriesRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoriesRepository.create(createCategoryDto);
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation code
        throw new ConflictException(`Category with name "${createCategoryDto.name}" already exists`);
      }
      throw error;
    }
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    try {
      Object.assign(category, updateCategoryDto);
      return await this.categoriesRepository.save(category);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation code
        throw new ConflictException(`Category with name "${updateCategoryDto.name}" already exists`);
      }
      throw error;
    }
  }

  async removeCategory(id: string) {
    const result = await this.categoriesRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}



