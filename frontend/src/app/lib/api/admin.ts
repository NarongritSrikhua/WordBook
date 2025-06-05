import { fetchAPI } from './fetch';

export interface DashboardStats {
  userStats: {
    total: number;
  };
  contentStats: {
    totalFlashcards: number;
  };
  activityStats: {
    totalPracticeSessions: number;
  };
  recentActivity: Array<{
    user: string;
    action: string;
    date: string;
    score: number;
  }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    console.log('[API] Fetching dashboard statistics');
    const stats = await fetchAPI('/api/admin/dashboard/stats');
    console.log('[API] Dashboard statistics fetched successfully');
    return stats;
  } catch (error) {
    console.error('[API] Error fetching dashboard statistics:', error);
    throw error;
  }
} 