import { ProgressBar } from '@/components/shared/ProgressBar';

export function LessonProgressBar({ current = 1, total = 1, hasCheckedAnswer = false }) {
  // Calculate progress based on completed questions
  // If current question hasn't been checked yet, progress = (current - 1) / total
  // If current question has been checked, progress = current / total
  const completedQuestions = hasCheckedAnswer ? current : current - 1;
  const percentage = (completedQuestions / total) * 100;
  
  return <ProgressBar percentage={percentage} />;
}
