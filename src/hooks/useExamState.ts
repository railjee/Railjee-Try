import { useState, useCallback } from 'preact/hooks';
import { Question } from '@/lib/types';
import { ExamMode, ReviewFilter, RestorableExamState, UseExamStateProps, UseExamStateReturn } from '@/lib/examTypes';
import { filterQuestions, getFilterCounts } from '@/lib/examUtils';

/**
 * Hook to manage exam state including:
 * - Current question navigation
 * - Answer tracking
 * - Review marking
 * - Question locking (practice mode)
 */
export function useExamState({ totalQuestions }: UseExamStateProps): UseExamStateReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [markedForReview, setMarkedForReview] = useState<boolean[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set());
  const [lockedQuestions, setLockedQuestions] = useState<boolean[]>([]);

  // Initialize exam state
  const initializeExam = useCallback((questionCount: number) => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers(new Array(questionCount).fill(null));
    setMarkedForReview(new Array(questionCount).fill(false));
    setLockedQuestions(new Array(questionCount).fill(false));
    setVisitedQuestions(new Set([0])); // First question is visited
  }, []);

  // Demo addition: restore a saved attempt from localStorage (see lib/storage.ts)
  const restoreState = useCallback((saved: RestorableExamState) => {
    setCurrentIndex(saved.currentIndex);
    setSelectedAnswer(saved.answers[saved.currentIndex] ?? null);
    setAnswers(saved.answers);
    setMarkedForReview(saved.markedForReview);
    setLockedQuestions(new Array(saved.answers.length).fill(false));
    setVisitedQuestions(new Set(saved.visited));
  }, []);

  // Save current answer to answers array
  const saveCurrentAnswer = useCallback(() => {
    if (selectedAnswer !== null) {
      setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentIndex] = selectedAnswer;
        return newAnswers;
      });
    }
  }, [currentIndex, selectedAnswer]);

  // Select an answer
  const selectAnswer = useCallback((optionIndex: number, isPracticeMode: boolean) => {
    if (isPracticeMode) {
      // In practice mode, lock after first selection
      if (selectedAnswer === null) {
        setSelectedAnswer(optionIndex);
        setLockedQuestions(prev => {
          const newLocked = [...prev];
          newLocked[currentIndex] = true;
          return newLocked;
        });
        // Also save to answers
        setAnswers(prev => {
          const newAnswers = [...prev];
          newAnswers[currentIndex] = optionIndex;
          return newAnswers;
        });
      }
      // If already locked, do nothing
    } else {
      // In exam mode, allow toggling
      if (selectedAnswer === optionIndex) {
        setSelectedAnswer(null);
        // Remove answer from answers array
        setAnswers(prev => {
          const newAnswers = [...prev];
          newAnswers[currentIndex] = null;
          return newAnswers;
        });
      } else {
        setSelectedAnswer(optionIndex);
        // Save answer to answers array immediately
        setAnswers(prev => {
          const newAnswers = [...prev];
          newAnswers[currentIndex] = optionIndex;
          return newAnswers;
        });
      }
    }
  }, [currentIndex, selectedAnswer]);

  // Navigate to specific question
  const goToQuestion = useCallback((index: number) => {
    if (index < 0 || index >= totalQuestions) return;
    
    saveCurrentAnswer();
    setCurrentIndex(index);
    setSelectedAnswer(answers[index]);
    setVisitedQuestions(prev => new Set([...prev, index]));
  }, [totalQuestions, answers, saveCurrentAnswer]);

  // Go to next question
  const goToNextQuestion = useCallback((): boolean => {
    if (currentIndex >= totalQuestions - 1) return false;
    
    saveCurrentAnswer();
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setSelectedAnswer(answers[nextIndex]);
    setVisitedQuestions(prev => new Set([...prev, nextIndex]));
    return true;
  }, [currentIndex, totalQuestions, answers, saveCurrentAnswer]);

  // Go to previous question
  const goToPreviousQuestion = useCallback((): boolean => {
    if (currentIndex <= 0) return false;
    
    saveCurrentAnswer();
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setSelectedAnswer(answers[prevIndex]);
    setVisitedQuestions(prev => new Set([...prev, prevIndex]));
    return true;
  }, [currentIndex, answers, saveCurrentAnswer]);

  // Toggle mark for review
  const toggleMarkForReview = useCallback(() => {
    setMarkedForReview(prev => {
      const newMarked = [...prev];
      newMarked[currentIndex] = !newMarked[currentIndex];
      return newMarked;
    });
  }, [currentIndex]);

  // Derived values
  const answeredCount = answers.filter(a => a !== null).length;
  const skippedCount = answers.filter(a => a === null).length;
  const markedCount = markedForReview.filter(Boolean).length;

  return {
    currentIndex,
    selectedAnswer,
    answers,
    markedForReview,
    visitedQuestions,
    lockedQuestions,
    answeredCount,
    skippedCount,
    markedCount,
    initializeExam,
    restoreState,
    selectAnswer,
    goToQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    toggleMarkForReview,
    saveCurrentAnswer
  };
}

/**
 * Hook to manage question review state
 */
export function useQuestionReview(questions: Question[], answers: (number | null)[]) {
  const [reviewIndex, setReviewIndex] = useState(0);
  const [filter, setFilter] = useState<ReviewFilter>('all');

  // Get filtered questions with their original indices
  const getFilteredQuestions = useCallback(() => {
    return filterQuestions(questions, answers, filter);
  }, [questions, answers, filter]);

  // Get counts for each filter
  const getFilterCountsMemo = useCallback(() => {
    return getFilterCounts(questions, answers);
  }, [questions, answers]);

  // Navigation
  const goToNext = useCallback(() => {
    const filtered = getFilteredQuestions();
    if (reviewIndex < filtered.length - 1) {
      setReviewIndex(reviewIndex + 1);
    }
  }, [reviewIndex, getFilteredQuestions]);

  const goToPrevious = useCallback(() => {
    if (reviewIndex > 0) {
      setReviewIndex(reviewIndex - 1);
    }
  }, [reviewIndex]);

  const goToIndex = useCallback((index: number) => {
    setReviewIndex(index);
  }, []);

  const changeFilter = useCallback((newFilter: ReviewFilter) => {
    setFilter(newFilter);
    setReviewIndex(0); // Reset to first question when filter changes
  }, []);

  return {
    reviewIndex,
    filter,
    filteredQuestions: getFilteredQuestions(),
    filterCounts: getFilterCountsMemo(),
    goToNext,
    goToPrevious,
    goToIndex,
    changeFilter
  };
}

// Re-export types for convenience
export type { ExamMode, ReviewFilter };
