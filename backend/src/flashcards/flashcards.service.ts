import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flashcard } from './entities/flashcard.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(Flashcard)
    private flashcardsRepository: Repository<Flashcard>,
  ) {}

  async create(createFlashcardDto: CreateFlashcardDto, userId: string): Promise<Flashcard> {
    const flashcard = this.flashcardsRepository.create({
      ...createFlashcardDto,
      userId,
    });
    
    return this.flashcardsRepository.save(flashcard);
  }

  // รองรับกรณี userId เป็น optional
  async findAll(userId?: string): Promise<Flashcard[]> {
    if (userId) {
      // คืน flashcards ของ user นั้น
      return this.flashcardsRepository.find({ where: { userId } });
    }
    // กรณี public คืน flashcards ทั้งหมด (หรือจะกรองเฉพาะที่ public ได้ถ้ามี field)
    return this.flashcardsRepository.find();
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
}
