import { useCallback } from 'preact/hooks';
import { Question } from '@/lib/types';
import { SubmissionResult, QuestionResult, MarkingScheme, UseExamSubmissionProps, UseExamSubmissionReturn } from '@/lib/examTypes';

/**
 * Hook to handle exam submission and scoring logic
 */
export function useExamSubmission({
  initialTime,
  markingScheme
}: UseExamSubmissionProps): UseExamSubmissionReturn {

  // Calculate exam results
  const calculateResult = useCallback((
    questions: Question[],
    answers: (number | null)[],
    timeRemaining: number
  ): SubmissionResult => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const questionResults: QuestionResult[] = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isSkipped = userAnswer === null;
      const isCorrect = !isSkipped && userAnswer === question.correctAnswer;

      if (isSkipped) {
        skipped++;
      } else if (isCorrect) {
        correct++;
      } else {
        wrong++;
      }

      questionResults.push({
        questionIndex: index,
        userAnswer,
        correctAnswer: question.correctAnswer ?? -1,
        isCorrect,
        isSkipped
      });
    });

    // Calculate score using marking scheme
    const score = 
      (correct * markingScheme.correct) +
      (wrong * markingScheme.incorrect) +
      (skipped * markingScheme.unattempted);

    const totalQuestions = questions.length;
    const maxScore = totalQuestions * markingScheme.correct;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const timeTaken = initialTime - timeRemaining;

    return {
      score: Math.max(0, score), // Ensure score doesn't go negative
      totalQuestions,
      correctAnswers: correct,
      wrongAnswers: wrong,
      skippedQuestions: skipped,
      percentage: Math.max(0, percentage),
      timeTaken,
      questionResults
    };
  }, [markingScheme, initialTime]);

  return {
    calculateResult
  };
}
