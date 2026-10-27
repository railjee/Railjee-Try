// Common utility functions for exams

import { Question } from './types';
import { FilterCounts, ReviewFilter } from './examTypes';

/**
 * Format time in seconds to display string (HH:MM:SS or MM:SS)
 */
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format time duration to readable string (e.g., "1h 23m 45s")
 */
export function formatTimeDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Get grade based on percentage
 */
export function getGrade(percentage: number): { grade: string; color: string } {
  if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
  if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
  if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600' };
  if (percentage >= 60) return { grade: 'B', color: 'text-blue-500' };
  if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600' };
  if (percentage >= 40) return { grade: 'D', color: 'text-orange-500' };
  return { grade: 'F', color: 'text-red-500' };
}

/**
 * Get filter counts for questions
 */
export function getFilterCounts(questions: Question[], answers: (number | null)[]): FilterCounts {
  let correct = 0, wrong = 0, skipped = 0;
  
  questions.forEach((q, index) => {
    const answer = answers[index];
    if (answer === null) skipped++;
    else if (answer === q.correctAnswer) correct++;
    else wrong++;
  });

  return { all: questions.length, correct, wrong, skipped };
}

/**
 * Filter questions based on review filter
 */
export function filterQuestions(
  questions: Question[],
  answers: (number | null)[],
  filter: ReviewFilter
) {
  return questions
    .map((q, index) => ({ question: q, index, answer: answers[index] }))
    .filter(({ question, answer }) => {
      switch (filter) {
        case 'correct': return answer === question.correctAnswer;
        case 'wrong': return answer !== null && answer !== question.correctAnswer;
        case 'skipped': return answer === null;
        default: return true;
      }
    });
}

/**
 * Check if time is low. Demo: 2 minutes (main site uses 5, but demos are ~8 minutes long).
 */
export function isTimeLow(seconds: number): boolean {
  return seconds < 120;
}
