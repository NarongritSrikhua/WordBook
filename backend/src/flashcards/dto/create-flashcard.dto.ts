import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUrl } from 'class-validator';

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

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

