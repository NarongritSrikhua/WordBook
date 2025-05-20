import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PracticeSetService } from './practice-set.service';
import { CreatePracticeSetDto } from './dto/create-practice-set.dto';
import { UpdatePracticeSetDto } from './dto/update-practice-set.dto';

@ApiTags('practice-sets')
@Controller('practice/sets')
export class PracticeSetController {
  constructor(private readonly practiceSetService: PracticeSetService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a new practice set' })
  @ApiResponse({ status: 201, description: 'The practice set has been successfully created.' })
  create(@Body() createPracticeSetDto: CreatePracticeSetDto) {
    return this.practiceSetService.create(createPracticeSetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all practice sets' })
  @ApiResponse({ status: 200, description: 'Return all practice sets.' })
  findAll() {
    return this.practiceSetService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a practice set by id' })
  @ApiResponse({ status: 200, description: 'Return the practice set.' })
  @ApiResponse({ status: 404, description: 'Practice set not found.' })
  findOne(@Param('id') id: string) {
    return this.practiceSetService.findOne(id);
  }

  @Get(':id/with-questions')
  @ApiOperation({ summary: 'Get a practice set with its questions' })
  @ApiResponse({ status: 200, description: 'Return the practice set with questions.' })
  @ApiResponse({ status: 404, description: 'Practice set not found.' })
  findOneWithQuestions(@Param('id') id: string) {
    return this.practiceSetService.findOneWithQuestions(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update a practice set' })
  @ApiResponse({ status: 200, description: 'The practice set has been successfully updated.' })
  update(@Param('id') id: string, @Body() updatePracticeSetDto: UpdatePracticeSetDto) {
    return this.practiceSetService.update(id, updatePracticeSetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a practice set' })
  @ApiResponse({ status: 200, description: 'The practice set has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.practiceSetService.remove(id);
  }
}