import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('words')
@UseGuards(JwtAuthGuard)
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  create(@Body() createWordDto: CreateWordDto, @Request() req) {
    return this.wordsService.create(createWordDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req) {
    return this.wordsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.wordsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWordDto: UpdateWordDto, @Request() req) {
    return this.wordsService.update(id, updateWordDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.wordsService.remove(id, req.user.userId);
  }

  @Patch(':id/favorite')
  toggleFavorite(@Param('id') id: string, @Request() req) {
    return this.wordsService.toggleFavorite(id, req.user.userId);
  }

  @Patch(':id/proficiency')
  updateProficiency(@Param('id') id: string, @Body('proficiency') proficiency: number, @Request() req) {
    return this.wordsService.updateProficiency(id, proficiency, req.user.userId);
  }
}