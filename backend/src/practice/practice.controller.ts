import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { UpdatePracticeDto } from './dto/update-practice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('practice')
@Controller('practice')
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
  @ApiResponse({ status: 404, description: 'Practice question not found.' })
  update(@Param('id') id: string, @Body() updatePracticeDto: UpdatePracticeDto) {
    return this.practiceService.update(id, updatePracticeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a practice question' })
  @ApiResponse({ status: 200, description: 'The practice question has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Practice question not found.' })
  remove(@Param('id') id: string) {
    return this.practiceService.remove(id);
  }
}