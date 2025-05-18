import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  word: string;

  @IsString()
  @IsNotEmpty()
  definition: string;

  @IsString()
  @IsOptional()
  example?: string;

  @IsString()
  @IsOptional()
  pronunciation?: string;

  @IsString()
  @IsOptional()
  partOfSpeech?: string;
}