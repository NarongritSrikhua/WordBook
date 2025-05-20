import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}