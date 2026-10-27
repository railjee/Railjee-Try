import { ExamActionBarProps } from '@/lib/examTypes';

export default function ExamActionBar({
  currentQuestionIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit
}: ExamActionBarProps) {
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleNextOrSubmit = () => {
    if (isLastQuestion) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-stone-100 text-stone-700 rounded-lg sm:rounded-xl hover:bg-stone-200 transition-all font-semibold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Next/Submit Button */}
        <button
          onClick={handleNextOrSubmit}
          className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all font-semibold text-xs sm:text-sm"
        >
          <span>{isLastQuestion ? 'Submit' : 'Next'}</span>
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
