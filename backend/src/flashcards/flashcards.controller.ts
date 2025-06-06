import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  // Public endpoint - no guard
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Request() req?: any
  ) {
    return this.flashcardsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortField,
      sortOrder,
      search,
      category,
      userId: req?.user?.userId
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFlashcardDto: CreateFlashcardDto, @Request() req) {
    return this.flashcardsService.create(createFlashcardDto, req.user.userId);
  }

  // Categories endpoints - must be placed BEFORE the :id routes to avoid conflict
  // Public endpoint for categories
  @Get('categories')
  findAllCategories() {
    return this.flashcardsService.findAllCategories();
  }

  @UseGuards(JwtAuthGuard)
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.flashcardsService.createCategory(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.flashcardsService.updateCategory(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.flashcardsService.removeCategory(id);
  }

  // Flashcard endpoints
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.flashcardsService.findOne(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateFlashcardDto: UpdateFlashcardDto, @Request() req) {
    console.log(`Updating flashcard ${id} with data:`, updateFlashcardDto);
    console.log(`User role: ${req.user.role}, User ID: ${req.user.userId}`);
    
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
    console.log(`Deleting flashcard ${id}`);
    console.log(`User role: ${req.user.role}, User ID: ${req.user.userId}`);
    
    // Check if user is admin
    if (req.user.role === UserRole.ADMIN) {
      return this.flashcardsService.removeAsAdmin(id);
    }
    // Regular user can only delete their own flashcards
    return this.flashcardsService.remove(id, req.user.userId);
  }

  @Post(':id/review')
  review(@Param('id') id: string, @Body() reviewFlashcardDto: ReviewFlashcardDto, @Request() req) {
    return this.flashcardsService.review(id, reviewFlashcardDto, req.user.userId);
  }
}



