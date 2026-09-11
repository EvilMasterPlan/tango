import { adminApi } from '@/utils/api/admin';
import { useDailyCounts } from './useDailyCounts';

export function useDailyLessonsCompleted() {
  return useDailyCounts(adminApi.getDailyLessonsCompleted);
}
