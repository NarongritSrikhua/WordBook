import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PracticeService } from './practice.service';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';
import { UpdatePracticeSetDto } from './dto/update-practice-set.dto';

@ApiTags('practice')
@Controller('practice/questions')  // Changed from 'practice' to 'practice/questions'
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new practice question' })
  @ApiResponse({ status: 201, description: 'The practice question has been successfully created.' })
  create(@Body() createPracticeDto: CreatePracticeDto) {
    return this.practiceService.create(createPracticeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all practice questions' })
  @ApiResponse({ status: 200, description: 'Return all practice questions.' })
  findAll() {
    return this.practiceService.findAll();
  }

  @Get('questions/random')
  @ApiOperation({ summary: 'Get random practice questions' })
  @ApiQuery({ name: 'count', required: false, type: Number, description: 'Number of questions to return' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Return random practice questions.' })
  async getRandomQuestions(
    @Query('count') count: number = 10,
    @Query('category') category?: string
  ) {
    console.log(`[Backend] Fetching random questions. Count: ${count}, Category: ${category || 'All'}`);
    
    try {
      // Get random questions with category filter
      const questions = await this.practiceService.getRandomQuestions(count, category);
      
      // Log the result
      console.log(`[Backend] Returning ${questions.length} random questions`);
      if (category) {
        const matchingCategory = questions.filter(q => q.category === category).length;
        console.log(`[Backend] ${matchingCategory} questions match the requested category '${category}'`);
      }
      
      return questions;
    } catch (error) {
      console.error('[Backend] Error fetching random questions:', error);
      throw new InternalServerErrorException('Failed to fetch random questions');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a practice question by id' })
  @ApiResponse({ status: 200, description: 'Return the practice question.' })
  @ApiResponse({ status: 404, description: 'Practice question not found.' })
  findOne(@Param('id') id: string) {
    return this.practiceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update a practice question' })
  @ApiResponse({ status: 200, description: 'The practice question has been successfully updated.' })
  async update(@Param('id') id: string, @Body() updatePracticeDto: UpdatePracticeDto) {
    return this.practiceService.update(id, updatePracticeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a practice question' })
  @ApiResponse({ status: 200, description: 'The practice question has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.practiceService.remove(id);
  }

  @Get('category')
  @ApiOperation({ summary: 'Get all practice categories' })
  @ApiResponse({ status: 200, description: 'Return all practice categories.' })
  async getCategories() {
    try {
      // Get all questions first
      const questions = await this.practiceService.findAll();
      
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




