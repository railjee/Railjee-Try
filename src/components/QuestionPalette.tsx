import { Question } from '@/lib/types';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answers: (number | null)[];
  markedForReview: boolean[];
  visitedQuestions: Set<number>;
  onQuestionJump: (index: number) => void;
  showMobile?: boolean;
  onCloseMobile?: () => void;
  reviewMode?: boolean;
  questions?: Question[];
}

export default function QuestionPalette({
  totalQuestions,
  currentQuestionIndex,
  answers,
  markedForReview,
  visitedQuestions,
  onQuestionJump,
  showMobile = false,
  onCloseMobile,
  reviewMode = false,
  questions = []
}: QuestionPaletteProps) {
  const answeredCount = answers.filter(a => a !== null).length;
  const markedCount = markedForReview.filter(Boolean).length;
  const skippedCount = answers.filter(a => a === null).length;
  
  // Calculate review mode stats
  const correctCount = reviewMode && questions.length > 0 
    ? answers.filter((answer, index) => answer !== null && answer === questions[index]?.correctAnswer).length 
    : 0;
  const wrongCount = reviewMode && questions.length > 0
    ? answers.filter((answer, index) => answer !== null && answer !== questions[index]?.correctAnswer).length
    : 0;

  const content = (
    <>
      {/* Stats Summary */}
      <div className="p-3 sm:p-4 lg:p-5 bg-stone-50 border-b border-stone-100">
        {reviewMode ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-green-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-green-500 flex flex-col items-center justify-center">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{correctCount}</p>
              <p className="text-xxs sm:text-xs text-green-700 uppercase tracking-wide">Correct</p>
            </div>
            <div className="bg-red-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-red-500 flex flex-col items-center justify-center">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{wrongCount}</p>
              <p className="text-xxs sm:text-xs text-red-700 uppercase tracking-wide">Wrong</p>
            </div>
            <div className="bg-stone-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-stone-400 flex flex-col items-center justify-center">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-stone-600">{skippedCount}</p>
              <p className="text-xxs sm:text-xs text-stone-700 uppercase tracking-wide">Skipped</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-blue-400 flex flex-col items-center justify-center">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{answeredCount}</p>
              <p className="text-xxs sm:text-xs text-blue-700 uppercase tracking-wide">Answered</p>
            </div>
            <div className="bg-stone-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-stone-400 flex flex-col items-center justify-center">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-stone-600">{skippedCount}</p>
              <p className="text-xxs sm:text-xs text-stone-700 uppercase tracking-wide">Skipped</p>
            </div>
            <div className="bg-amber-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border-2 border-amber-500 flex flex-col items-center justify-center">
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{markedCount}</p>
              <p className="text-xxs sm:text-xs text-amber-700 uppercase tracking-wide">Flagged</p>
            </div>
          </div>
        )}
      </div>

      {/* Question Overview */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
        <p className="text-xxs sm:text-xs text-stone-500 uppercase tracking-wide mb-2 sm:mb-3 font-medium text-center">Question Overview</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const answer = answers[index];
            const isAnswered = answer !== null;
            const isMarked = markedForReview[index];
            const isVisited = visitedQuestions.has(index);
            const isCurrent = index === currentQuestionIndex;
            
            let buttonStyle = 'border-2 border-stone-300 text-stone-600 bg-white';
            
            if (reviewMode && questions.length > 0) {
              // Review mode styling - consistent with exam mode
              const isCorrectAnswer = answer !== null && answer === questions[index]?.correctAnswer;
              const isWrongAnswer = answer !== null && !isCorrectAnswer;
              
              if (isCorrectAnswer) {
                buttonStyle = isCurrent 
                  ? 'border-2 border-green-500 bg-green-500 text-white ring-4 ring-blue-300'
                  : 'border-2 border-green-500 bg-green-500 text-white';
              } else if (isWrongAnswer) {
                buttonStyle = isCurrent
                  ? 'border-2 border-red-500 bg-red-500 text-white ring-4 ring-blue-300'
                  : 'border-2 border-red-500 bg-red-500 text-white';
              } else {
                // Skipped
                buttonStyle = isCurrent
                  ? 'border-2 border-stone-400 bg-stone-400 text-white ring-4 ring-blue-300'
                  : 'border-2 border-stone-400 bg-stone-400 text-white';
              }
            } else {
              // Exam mode styling
              if (isAnswered) {
                buttonStyle = isCurrent
                  ? 'border-2 border-blue-400 bg-blue-400 text-white ring-4 ring-blue-300'
                  : 'border-2 border-blue-400 bg-blue-400 text-white';
              } else if (isMarked) {
                buttonStyle = isCurrent
                  ? 'border-2 border-amber-500 bg-amber-500 text-white ring-4 ring-blue-300'
                  : 'border-2 border-amber-500 bg-amber-500 text-white';
              } else if (isVisited) {
                buttonStyle = isCurrent
                  ? 'border-2 border-stone-400 bg-stone-400 text-white ring-4 ring-blue-300'
                  : 'border-2 border-stone-400 bg-stone-400 text-white';
              } else {
                // Not visited
                buttonStyle = isCurrent
                  ? 'border-2 border-stone-300 bg-white text-stone-600 ring-4 ring-blue-300'
                  : 'border-2 border-stone-300 text-stone-600 bg-white';
              }
            }

            return (
              <button
                key={index}
                onClick={() => {
                  onQuestionJump(index);
                  if (showMobile && onCloseMobile) {
                    onCloseMobile();
                  }
                }}
                className={`h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 rounded-full font-semibold transition-all text-xs sm:text-sm mx-auto ${buttonStyle}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        {reviewMode ? (
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-4 lg:mt-5 pt-3 sm:pt-4 border-t border-stone-100 text-xxs sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 border-2 border-green-500"></div>
              <span className="text-stone-600">Correct</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 border-2 border-red-500"></div>
              <span className="text-stone-600">Wrong</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-stone-400 border-2 border-stone-400"></div>
              <span className="text-stone-600">Skipped</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white border-2 border-blue-500 ring-2 ring-blue-300"></div>
              <span className="text-stone-600">Current</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-4 lg:mt-5 pt-3 sm:pt-4 border-t border-stone-100 text-xxs sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-400 border-2 border-blue-400"></div>
              <span className="text-stone-600">Answered</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-stone-400 border-2 border-stone-400"></div>
              <span className="text-stone-600">Skipped</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-500 border-2 border-amber-500"></div>
              <span className="text-stone-600">Flagged</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white border-2 border-blue-500 ring-2 ring-blue-300"></div>
              <span className="text-stone-600">Current</span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Mobile version - Drawer from right
  if (showMobile) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onCloseMobile}
      >
        <div 
          className="absolute top-0 right-0 bottom-0 w-64 sm:w-72 bg-white shadow-2xl flex flex-col animate-slide-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 border-b border-stone-100 bg-stone-50">
            <button
              onClick={onCloseMobile}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-stone-200 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center flex-1">
              <h3 className="font-bold text-stone-800 text-sm sm:text-base">Question Palette</h3>
              <p className="text-xxs sm:text-xs text-stone-500">Question : {totalQuestions} Answered : {answeredCount}</p>
            </div>
            <div className="w-7 sm:w-8"></div>
          </div>
          {content}
        </div>
      </div>
    );
  }

  // Desktop version - only render on desktop screens
  // On mobile, return null when drawer is closed
  return null;
}
