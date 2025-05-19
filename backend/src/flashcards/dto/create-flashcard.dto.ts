import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateFlashcardDto {
  @IsNotEmpty()
  @IsString()
  front: string;

  @IsNotEmpty()
  @IsString()
  back: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: 'easy' | 'medium' | 'hard';
}