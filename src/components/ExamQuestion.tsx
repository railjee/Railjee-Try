import { useEffect, useRef } from 'preact/hooks';
import { Question } from '@/lib/types';
import MathText from '@/components/MathText';

interface ExamQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelectAnswer: (optionIndex: number) => void;
  markedForReview?: boolean;
  onToggleMarkForReview?: () => void;
  reviewMode?: boolean;
  correctAnswer?: number;
  onSubmit?: () => void;
  showSubmitButton?: boolean;
  practiceMode?: boolean;
  isLocked?: boolean;
  /** Demo addition: marks deducted per wrong answer, shown in the header */
  negativeMarking?: number;
}

export default function ExamQuestion({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  markedForReview = false,
  onToggleMarkForReview,
  reviewMode = false,
  correctAnswer,
  onSubmit,
  showSubmitButton = false,
  practiceMode = false,
  isLocked = false,
  negativeMarking = 0.33
}: ExamQuestionProps) {
  const actualCorrectAnswer = correctAnswer ?? question.correctAnswer;
  const showFeedback = (practiceMode && selectedAnswer !== null) || reviewMode;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when question changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [questionIndex]);

  return (
    <div className="w-full flex flex-col max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-160px)]">
      {/* Question Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
        {/* Question Header with Flag Button - Sticky */}
        <div className={`sticky top-0 z-10 px-3 sm:px-4 lg:px-5 py-4 text-white ${
          showFeedback
            ? selectedAnswer === actualCorrectAnswer
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : selectedAnswer === null
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : 'bg-gradient-to-r from-red-500 to-red-600'
            : 'bg-gradient-to-r from-orange-600 to-orange-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-white/20 backdrop-blur rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg">
                {questionIndex + 1}
              </span>
              <div>
                <p className="text-xs sm:text-sm opacity-90">Question {questionIndex + 1} of {totalQuestions}</p>
                <p className="text-xxs sm:text-xs opacity-75">
                  {showFeedback
                    ? selectedAnswer === actualCorrectAnswer
                      ? practiceMode ? '✓ Correct Answer!' : 'Answered Correctly'
                      : selectedAnswer === null
                      ? 'Skipped'
                      : practiceMode ? '✗ Incorrect' : 'Answered Incorrectly'
                    : `+1 for correct, -${negativeMarking} for wrong`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {showSubmitButton && onSubmit && (
                <button
                  onClick={onSubmit}
                  className="sm:hidden px-2.5 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-all"
                >
                  Submit
                </button>
              )}
              {onToggleMarkForReview && !reviewMode && (
                <button
                  onClick={onToggleMarkForReview}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    markedForReview
                      ? 'bg-amber-400 text-amber-900'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={markedForReview ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="hidden sm:inline">{markedForReview ? 'Flagged' : 'Flag for Review'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
          {/* Question Text */}
          <div className="p-3 sm:p-4 lg:p-5 border-b border-stone-100">
          {question.question.en && (
            <p className={`text-sm sm:text-base lg:text-lg font-semibold text-stone-800 leading-relaxed ${
              question.question.hi ? 'mb-2 sm:mb-3' : ''
            }`}>
              <MathText text={question.question.en} />
            </p>
          )}
          {question.question.hi && (
            <p className="text-sm sm:text-base lg:text-lg text-stone-600 leading-relaxed rounded-lg font-hindi">
              <MathText text={question.question.hi} />
            </p>
          )}
        </div>

        {/* Details Section - Collapsible & Compact */}
        {question.details && question.details.length > 0 && (
          <div className="border-b border-blue-100">
            {/* Details Content - Compact Grid */}
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-b from-blue-50/30 to-transparent">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
                  {question.details.map((detail, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 border border-blue-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex gap-1.5 sm:gap-2">
                        <div className="min-w-0">
                          {detail.en && (
                            <p className={`text-xs sm:text-sm font-medium text-stone-700 leading-relaxed line-clamp-3 ${
                              detail.hi ? 'mb-1.5 sm:mb-2' : ''
                            }`}>
                              <MathText text={detail.en} />
                            </p>
                          )}
                          {detail.hi && (
                            <p className="text-xs sm:text-md text-stone-700 leading-relaxed line-clamp-3 font-hindi">
                              <MathText text={detail.hi} />
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        )}

        {/* Options */}
        <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
          {question.options.map((option, optIndex) => {
            const optionLetter = String.fromCharCode(65 + optIndex);
            const isSelected = selectedAnswer === optIndex;
            const isCorrectOption = showFeedback && optIndex === actualCorrectAnswer;
            const isWrongOption = showFeedback && isSelected && optIndex !== actualCorrectAnswer;

            let optionStyle = 'border-stone-200 bg-white';
            let badgeStyle = 'bg-stone-100 text-stone-600';
            
            if (showFeedback) {
              if (isCorrectOption) {
                optionStyle = 'border-green-500 bg-green-50';
                badgeStyle = 'bg-green-500 text-white';
              } else if (isWrongOption) {
                optionStyle = 'border-red-500 bg-red-50';
                badgeStyle = 'bg-red-500 text-white';
              }
            } else if (isSelected) {
              optionStyle = 'border-orange-500 bg-orange-50 shadow-md';
              badgeStyle = 'bg-orange-500 text-white';
            }

            return (
              <button
                key={optIndex}
                onClick={() => onSelectAnswer(optIndex)}
                disabled={reviewMode || isLocked}
                className={`w-full text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                  optionStyle
                } ${
                  !reviewMode && !isSelected && !showFeedback && !isLocked ? 'hover:border-orange-300 hover:bg-orange-50/30' : ''
                } ${
                  reviewMode || isLocked ? 'cursor-default' : ''
                }`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
                  <span className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-base transition-all ${
                    badgeStyle
                  }`}>
                    {optionLetter}
                  </span>
                  <div className="flex-1 pt-0.5 sm:pt-1">
                    {option.en && (
                      <p className={`text-xs sm:text-sm lg:text-base font-medium ${
                        option.hi ? 'mb-1' : ''
                      } ${
                        isCorrectOption ? 'text-yellow-800' : isWrongOption ? 'text-red-800' : isSelected && !reviewMode ? 'text-orange-800' : 'text-stone-700'
                      }`}>
                        <MathText text={option.en} />
                      </p>
                    )}
                    {option.hi && (
                      <p className="text-xs sm:text-md lg:text-sm text-stone-600 font-hindi">
                        <MathText text={option.hi} />
                      </p>
                    )}
                  </div>
                  {/* Show different icons based on mode and feedback */}
                  {isSelected && !showFeedback && !reviewMode && (
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {isCorrectOption && showFeedback && (
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {isWrongOption && showFeedback && (
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
