import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('words')
export class Word {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  word: string;

  @Column()
  definition: string;

  @Column({ nullable: true })
  example: string;

  @Column({ nullable: true })
  pronunciation: string;

  @Column({ nullable: true })
  partOfSpeech: string;

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: 0 })
  proficiency: number;

  @ManyToOne(() => User, (user) => user.words)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}