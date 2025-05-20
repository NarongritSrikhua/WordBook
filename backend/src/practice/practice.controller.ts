import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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

  @Get('random')
  @ApiOperation({ summary: 'Get random practice questions' })
  @ApiResponse({ status: 200, description: 'Return random practice questions.' })
  getRandomQuestions(@Query('count', new ParseIntPipe({ optional: true })) count?: number) {
    return this.practiceService.getRandomQuestions(count);
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
  async update(@Param('id') id: string, @Body() updatePracticeSetDto: UpdatePracticeSetDto) {
    return this.practiceService.updatePracticeSet(id, updatePracticeSetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a practice question' })
  @ApiResponse({ status: 200, description: 'The practice question has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.practiceService.remove(id);
  }
}

