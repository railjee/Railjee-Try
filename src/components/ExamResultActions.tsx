interface ExamResultActionsProps {
  hasQuestions: boolean;
  onReviewAnswers: () => void;
  onBackToHome: () => void;
  /** Demo addition: the second button is "Retry" in the demo */
  backLabel?: string;
}

export default function ExamResultActions({
  hasQuestions,
  onReviewAnswers,
  onBackToHome,
  backLabel = 'Back to Home'
}: ExamResultActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
      {hasQuestions && (
        <button
          onClick={onReviewAnswers}
          data-track="review_open"
          className="flex-1 py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Review Answers
        </button>
      )}
      <button
        onClick={onBackToHome}
        className="flex-1 py-3 sm:py-3.5 lg:py-4 bg-white border-2 border-stone-300 text-stone-700 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:bg-stone-100 transition-all"
      >
        {backLabel}
      </button>
    </div>
  );
}
