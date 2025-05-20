import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, ValidateIf } from 'class-validator';
import { QuestionType, Difficulty } from '../entities/practice.entity';

export class CreatePracticeDto {
  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @ValidateIf(o => o.type === QuestionType.TEXT)
  @IsString()
  @IsNotEmpty()
  word?: string;

  @ValidateIf(o => o.type === QuestionType.IMAGE)
  @IsString()
  @IsNotEmpty()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  translation: string;

  @ValidateIf(o => o.type === QuestionType.TEXT || o.type === QuestionType.IMAGE)
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ValidateIf(o => o.type === QuestionType.FILL)
  @IsString()
  @IsNotEmpty()
  fillPrompt?: string;

  @ValidateIf(o => o.type === QuestionType.FILL)
  @IsString()
  @IsNotEmpty()
  answer?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsString()
  @IsOptional()
  category?: string;
}
