import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UserPreferencesDto {
  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  targetLanguage?: string;

  @IsString()
  @IsOptional()
  dailyGoal?: string;

  @IsString()
  @IsOptional()
  theme?: string;

  @IsBoolean()
  @IsOptional()
  notifications?: boolean;

  @IsBoolean()
  @IsOptional()
  soundEffects?: boolean;
}