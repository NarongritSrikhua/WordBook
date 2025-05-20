import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  front: string;

  @Column()
  back: string;

  @Column()
  category: string;

  @Column()
  difficulty: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true, type: 'timestamp' })
  lastReviewed: Date;

  @Column({ nullable: true, type: 'timestamp' })
  nextReview: Date;

  @ManyToOne(() => User, (user) => user.flashcards)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
