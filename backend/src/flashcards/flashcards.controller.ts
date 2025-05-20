import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  // Public endpoint - no guard
  @Get()
  findAll() {
    return this.flashcardsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFlashcardDto: CreateFlashcardDto, @Request() req) {
    return this.flashcardsService.create(createFlashcardDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.flashcardsService.findOne(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateFlashcardDto: UpdateFlashcardDto, @Request() req) {
    // Check if user is admin
    if (req.user.role === UserRole.ADMIN) {
      return this.flashcardsService.updateAsAdmin(id, updateFlashcardDto);
    }
    // Regular user can only update their own flashcards
    return this.flashcardsService.update(id, updateFlashcardDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Check if user is admin
    if (req.user.role === UserRole.ADMIN) {
      return this.flashcardsService.removeAsAdmin(id);
    }
    // Regular user can only delete their own flashcards
    return this.flashcardsService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/review')
  review(@Param('id') id: string, @Body() reviewFlashcardDto: ReviewFlashcardDto, @Request() req) {
    return this.flashcardsService.review(id, reviewFlashcardDto, req.user.userId);
  }
}

