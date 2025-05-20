import { IsNotEmpty, IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '../entities/practice.entity';
import { PracticeSetType } from '../entities/practice-set.entity';

export class CreatePracticeSetDto {
  @ApiProperty({ description: 'Name of the practice set' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the practice set', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Array of question IDs included in this set', type: [String] })
  @IsArray()
  @IsString({ each: true })
  questionIds: string[];

  @ApiProperty({ description: 'Difficulty level of the practice set', enum: Difficulty, required: false })
  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @ApiProperty({ description: 'Category of the practice set', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Type of the practice set', enum: PracticeSetType, required: false })
  @IsEnum(PracticeSetType)
  @IsOptional()
  type?: PracticeSetType;
}

