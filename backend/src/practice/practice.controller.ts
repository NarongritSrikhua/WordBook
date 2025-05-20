import { Controller, Get, Post, Body, Patch, Param, Delete, Query, InternalServerErrorException } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('practice')
@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('questions')
  create(@Body() createPracticeDto: CreatePracticeDto) {
    return this.practiceService.create(createPracticeDto);
  }

  @Get('questions')
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

  @Get('questions/:id')
  findOne(@Param('id') id: string) {
    return this.practiceService.findOne(id);
  }

  @Patch('questions/:id')
  update(@Param('id') id: string, @Body() updatePracticeDto: UpdatePracticeDto) {
    return this.practiceService.update(id, updatePracticeDto);
  }

  @Delete('questions/:id')
  remove(@Param('id') id: string) {
    return this.practiceService.remove(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all practice categories' })
  @ApiResponse({ status: 200, description: 'Return all practice categories.' })
  async getCategories() {
    try {
      return await this.practiceService.getCategories();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }
  
  // Add an alias for the categories endpoint to maintain backward compatibility
  @Get('category')
  @ApiOperation({ summary: 'Get all practice categories (alias)' })
  @ApiResponse({ status: 200, description: 'Return all practice categories.' })
  async getCategoriesAlias() {
    return this.getCategories();
  }
}
