// Common types for exam functionality

export type ExamMode = 'live' | 'mock';
export type ReviewFilter = 'all' | 'correct' | 'wrong' | 'skipped';


export interface SubmissionResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  percentage: number;
  timeTaken: number;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionIndex: number;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  isSkipped: boolean;
}

export interface FilterCounts {
  all: number;
  correct: number;
  wrong: number;
  skipped: number;
}

export interface MarkingScheme {
  correct: number;
  incorrect: number;
  unattempted: number;
}

// ============== Hook Props & Return Types ==============

export interface UseExamTimerProps {
  initialTime: number;
  isActive: boolean;
  onTimeUp: () => void;
}

export interface UseExamTimerReturn {
  timeRemaining: number;
  formattedTime: string;
  isLowTime: boolean;
  setTimeRemaining: (time: number) => void;
}

export interface UseExamStateProps {
  totalQuestions: number;
}

/** Demo addition: the parts of exam state saved to localStorage */
export interface RestorableExamState {
  currentIndex: number;
  answers: (number | null)[];
  markedForReview: boolean[];
  visited: number[];
}

export interface UseExamStateReturn {
  currentIndex: number;
  selectedAnswer: number | null;
  answers: (number | null)[];
  markedForReview: boolean[];
  visitedQuestions: Set<number>;
  lockedQuestions: boolean[];
  answeredCount: number;
  skippedCount: number;
  markedCount: number;
  initializeExam: (questionCount: number) => void;
  restoreState: (saved: RestorableExamState) => void;
  selectAnswer: (optionIndex: number, isPracticeMode: boolean) => void;
  goToQuestion: (index: number) => void;
  goToNextQuestion: () => boolean;
  goToPreviousQuestion: () => boolean;
  toggleMarkForReview: () => void;
  saveCurrentAnswer: () => void;
}

export interface UseExamSubmissionProps {
  initialTime: number;
  markingScheme: MarkingScheme;
}

export interface UseExamSubmissionReturn {
  calculateResult: (
    questions: any[],
    answers: (number | null)[],
    timeRemaining: number
  ) => SubmissionResult;
}

// ============== Component Props ==============

export interface ExamHeaderProps {
  examName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  answeredCount: number;
  onShowPalette: () => void;
  onSubmit: () => void;
}

export interface ExamActionBarProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export interface QuestionReviewProps {
  examName: string;
  questions: any[];
  answers: (number | null)[];
  markedForReview: boolean[];
  onBackToResult: () => void;
}

export interface FilteredQuestion {
  question: any;
  index: number;
  answer: number | null;
}
