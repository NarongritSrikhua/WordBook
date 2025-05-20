import { PartialType } from '@nestjs/swagger';
import { CreatePracticeSetDto } from './create-practice-set.dto';

export class UpdatePracticeSetDto extends PartialType(CreatePracticeSetDto) {}