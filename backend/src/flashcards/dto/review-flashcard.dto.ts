import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ReviewFlashcardDto {
  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;
}