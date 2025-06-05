import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Flashcard } from '../flashcards/entities/flashcard.entity';
import { PracticeHistory } from '../practice/entities/practice-history.entity';
import { MoreThan } from 'typeorm';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Flashcard)
    private flashcardsRepository: Repository<Flashcard>,
    @InjectRepository(PracticeHistory)
    private practiceHistoryRepository: Repository<PracticeHistory>,
  ) {}

  async getDashboardStats() {
    try {
      this.logger.log('Fetching dashboard statistics...');

      // Get user statistics
      const totalUsers = await this.usersRepository.count();
      this.logger.log(`Total users: ${totalUsers}`);

      const activeUsers = await this.usersRepository.count({
        where: {
          lastLoginAt: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        }
      });
      this.logger.log(`Active users: ${activeUsers}`);

      // Get content statistics
      const totalFlashcards = await this.flashcardsRepository.count();
      this.logger.log(`Total flashcards: ${totalFlashcards}`);

      const totalPracticeSessions = await this.practiceHistoryRepository.count();
      this.logger.log(`Total practice sessions: ${totalPracticeSessions}`);

      const averageScore = await this.practiceHistoryRepository
        .createQueryBuilder('history')
        .select('AVG(history.score)', 'average')
        .getRawOne()
        .then(result => result.average || 0);
      this.logger.log(`Average score: ${averageScore}`);

      // Get recent activity
      const recentActivity = await this.practiceHistoryRepository.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: 5
      });
      this.logger.log(`Found ${recentActivity.length} recent activities`);

      const formattedActivity = recentActivity.map(activity => ({
        user: activity.user?.name || 'Unknown User',
        action: 'Completed practice session',
        date: activity.createdAt,
        score: activity.score,
      }));

      const stats = {
        userStats: {
          total: totalUsers,
          active: activeUsers,
        },
        contentStats: {
          totalFlashcards: totalFlashcards,
        },
        activityStats: {
          totalPracticeSessions: totalPracticeSessions,
          averageScore: Math.round(averageScore),
        },
        recentActivity: formattedActivity,
      };

      this.logger.log('Successfully fetched dashboard statistics');
      return stats;
    } catch (error) {
      this.logger.error('Error getting dashboard stats:', error);
      throw new InternalServerErrorException('Failed to fetch dashboard statistics');
    }
  }
} 