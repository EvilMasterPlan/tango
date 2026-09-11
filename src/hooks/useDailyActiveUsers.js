import { adminApi } from '@/utils/api/admin';
import { useDailyCounts } from './useDailyCounts';

export function useDailyActiveUsers() {
  return useDailyCounts(adminApi.getDailyActiveUsers);
}
