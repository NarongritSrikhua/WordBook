import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Difficulty, QuestionType } from './practice.entity';

export enum PracticeSetType {
  TEXT = 'text',
  IMAGE = 'image',
  FILL = 'fill',
  MIXED = 'mixed',
}

@Entity('practice_sets')
export class PracticeSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('simple-array')
  questionIds: string[];

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.MEDIUM,
    nullable: true
  })
  difficulty: Difficulty;

  @Column({ nullable: true })
  category: string;

  @Column({
    type: 'enum',
    enum: PracticeSetType,
    default: PracticeSetType.MIXED,
    nullable: true
  })
  type: PracticeSetType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

