import { quizApi } from '@/utils/api/quiz';
import { useDailyCounts } from './useDailyCounts';

export function useEffort() {
  return useDailyCounts(quizApi.getEffort);
}
