import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('practice_history')
export class PracticeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

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