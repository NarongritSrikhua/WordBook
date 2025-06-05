import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Flashcard } from '../flashcards/entities/flashcard.entity';
import { PracticeHistory } from '../practice/entities/practice-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Flashcard, PracticeHistory]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {} 