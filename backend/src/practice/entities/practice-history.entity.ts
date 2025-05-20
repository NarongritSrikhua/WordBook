import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('practice_history')
export class PracticeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  practiceSetId?: string;

  @Column({ nullable: true })
  category?: string;

  @Column()
  totalQuestions: number;

  @Column()
  correctAnswers: number;

  @Column({ type: 'float' })
  score: number;

  @Column({ nullable: true })
  timeTaken?: number;

  @Column({ type: 'timestamp' })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}