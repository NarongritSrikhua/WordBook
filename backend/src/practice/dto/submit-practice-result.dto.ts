import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitPracticeResultDto {
  @ApiProperty({ description: 'User ID for the practice session', required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Category of the practice session', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'ID of the practice set if applicable', required: false })
  @IsString()
  @IsOptional()
  practiceSetId?: string;

  @ApiProperty({ description: 'Total number of questions in the practice session' })
  @IsNumber()
  @Min(1)
  totalQuestions: number;

  @ApiProperty({ description: 'Number of correctly answered questions' })
  @IsNumber()
  @Min(0)
  correctAnswers: number;

  @ApiProperty({ description: 'Score as a percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ description: 'Time taken to complete the practice session in seconds', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  timeTaken?: number;
}
