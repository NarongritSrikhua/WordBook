import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum QuestionType {
  TEXT = 'text',
  IMAGE = 'image',
  FILL = 'fill',
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('practice_questions')
export class PracticeQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.TEXT,
  })
  type: QuestionType;

  @Column({ nullable: true })
  word?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  translation: string;

  @Column('simple-array', { nullable: true })
  options?: string[];

  @Column({ nullable: true })
  fillPrompt?: string;

  @Column({ nullable: true })
  answer?: string;

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.MEDIUM,
  })
  difficulty: Difficulty;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
