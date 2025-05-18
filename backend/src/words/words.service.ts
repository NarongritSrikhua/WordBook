import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word } from './entities/word.entity';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    private wordsRepository: Repository<Word>,
  ) {}

  async create(createWordDto: CreateWordDto, userId: string): Promise<Word> {
    const word = this.wordsRepository.create({
      ...createWordDto,
      userId,
    });
    
    return this.wordsRepository.save(word);
  }

  async findAll(userId: string): Promise<Word[]> {
    return this.wordsRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Word> {
    const word = await this.wordsRepository.findOne({ 
      where: { id, userId } 
    });
    
    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }
    
    return word;
  }

  async update(id: string, updateWordDto: UpdateWordDto, userId: string): Promise<Word> {
    const word = await this.findOne(id, userId);
    
    const updatedWord = this.wordsRepository.merge(word, updateWordDto);
    return this.wordsRepository.save(updatedWord);
  }

  async remove(id: string, userId: string): Promise<void> {
    const word = await this.findOne(id, userId);
    await this.wordsRepository.remove(word);
  }

  async toggleFavorite(id: string, userId: string): Promise<Word> {
    const word = await this.findOne(id, userId);
    word.isFavorite = !word.isFavorite;
    return this.wordsRepository.save(word);
  }

  async updateProficiency(id: string, proficiency: number, userId: string): Promise<Word> {
    const word = await this.findOne(id, userId);
    word.proficiency = proficiency;
    return this.wordsRepository.save(word);
  }
}