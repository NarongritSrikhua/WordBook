import { PartialType } from '@nestjs/mapped-types';
import { CreateWordDto } from './create-word.dto';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateWordDto extends PartialType(CreateWordDto) {
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  proficiency?: number;
}