import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  level: string;

  @Column({ nullable: true })
  targetLanguage: string;

  @Column({ nullable: true })
  dailyGoal: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: true })
  notifications: boolean;

  @Column({ default: true })
  soundEffects: boolean;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}