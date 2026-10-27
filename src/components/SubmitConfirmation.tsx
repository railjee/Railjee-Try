interface SubmitConfirmationProps {
  totalQuestions: number;
  answeredCount: number;
  skippedCount: number;
  markedCount: number;
  answers: (number | null)[];
  markedForReview: boolean[];
  visitedQuestions: Set<number>;
  onSubmit: () => void;
  onCancel: () => void;
  onQuestionJump: (index: number) => void;
  isSubmitting?: boolean;
}

export default function SubmitConfirmation({
  totalQuestions,
  answeredCount,
  skippedCount,
  markedCount,
  answers,
  markedForReview,
  visitedQuestions,
  onSubmit,
  onCancel,
  onQuestionJump,
  isSubmitting = false
}: SubmitConfirmationProps) {
  const getQuestionStatus = (index: number) => {
    const isAnswered = answers[index] !== null;
    const isMarked = markedForReview[index];
    
    if (isAnswered) return 'bg-blue-400 text-white';
    if (isMarked) return 'bg-amber-500 text-white';
    if (visitedQuestions.has(index)) return 'bg-stone-400 text-white';
    return 'bg-stone-200 text-stone-600';
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={!isSubmitting ? onCancel : undefined}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[60vh] sm:max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-2 sm:p-4 lg:p-5 border-b border-stone-100">
          <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-stone-800 mb-0.5">Submit Exam Confirmation</h2>
          <p className="text-xxs sm:text-sm text-stone-500">Review your answers before final submission</p>
        </div>

        {/* Stats Summary */}
        <div className="p-2 sm:p-4 lg:p-5 bg-stone-50 border-b border-stone-100">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-1.5 sm:p-3 border-2 border-blue-400 flex flex-col items-center justify-center">
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-blue-600">{answeredCount}</p>
              <p className="text-xxs sm:text-xs text-blue-700 uppercase tracking-wide">Answered</p>
            </div>
            <div className="bg-stone-50 rounded-lg sm:rounded-xl p-1.5 sm:p-3 border-2 border-stone-400 flex flex-col items-center justify-center">
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-stone-600">{skippedCount}</p>
              <p className="text-xxs sm:text-xs text-stone-700 uppercase tracking-wide">Skipped</p>
            </div>
            <div className="bg-amber-50 rounded-lg sm:rounded-xl p-1.5 sm:p-3 border-2 border-amber-500 flex flex-col items-center justify-center">
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-amber-600">{markedCount}</p>
              <p className="text-xxs sm:text-xs text-amber-700 uppercase tracking-wide">Review</p>
            </div>
          </div>
        </div>

        {/* Question Overview */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-5">
          <p className="text-xxs sm:text-xs text-stone-500 uppercase tracking-wide mb-1.5 sm:mb-3 font-medium text-center">Question Overview</p>
          <div className="grid grid-cols-8 sm:grid-cols-8 gap-1 sm:gap-2">
            {Array.from({ length: totalQuestions }).map((_, index) => {
              const statusColor = getQuestionStatus(index);

              return (
                <button
                  key={index}
                  onClick={() => {
                    onCancel();
                    onQuestionJump(index);
                  }}
                  disabled={isSubmitting}
                  className={`h-6 sm:h-8 rounded-md font-medium text-[10px] sm:text-xs transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${statusColor}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-2 sm:mt-4 lg:mt-5 pt-2 sm:pt-4 border-t border-stone-100 text-xxs sm:text-xs">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-400"></div>
              <span className="text-stone-600">Answered</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-stone-400"></div>
              <span className="text-stone-600">Skipped</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-amber-500"></div>
              <span className="text-stone-600">For Review</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-stone-200"></div>
              <span className="text-stone-600">Not Visited</span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mt-2 sm:mt-4 lg:mt-5 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl">
            <p className="text-xxs sm:text-xs text-amber-800 text-center">
              ⚠️ You cannot change your answers after submission
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-2 sm:p-4 lg:p-5 border-t border-stone-100 bg-stone-50">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-2.5 sm:py-3 bg-white border-2 border-stone-300 text-stone-700 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-stone-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go Back
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Exam'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
