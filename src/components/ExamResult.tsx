interface ExamResultProps {
  isPassed: boolean;
  passPercentage: number;
  score: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedQuestions: number;
  totalQuestions: number;
  timeTaken: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  attemptedQuestions: number;
  accuracy: number;
}

function formatTimeTaken({ hours, minutes, seconds }: { hours: number; minutes: number; seconds: number }): string {
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

export default function ExamResult({ 
  isPassed, 
  passPercentage, 
  score, 
  percentage,
  correctAnswers,
  incorrectAnswers,
  unattemptedQuestions,
  totalQuestions,
  timeTaken,
  attemptedQuestions,
  accuracy
}: ExamResultProps) {

  return (
    <>
      {/* Result Badge */}
      <div
        className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 text-center mb-4 sm:mb-5 lg:mb-6 text-white shadow-lg ` +
          (
            percentage < 50
              ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700'
              : percentage < passPercentage
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600'
          )
        }
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-2 sm:mb-3 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
          {isPassed ? (
            <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
          {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
        </h2>
        <p className="text-white/90 mb-3 sm:mb-4 text-xs sm:text-sm">
          {isPassed
            ? 'You passed the exam successfully'
            : `You need to score at least ${passPercentage}% to pass`}
        </p>
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <div>
            <p className="text-2xl sm:text-3xl font-bold mb-1">{score.toFixed(2)}</p>
            <p className="text-white/80 text-xxs sm:text-xs">Your Score</p>
          </div>
          <div className="w-px h-10 sm:h-12 bg-white/30"></div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold mb-1">{Math.max(0, percentage).toFixed(1)}%</p>
            <p className="text-white/80 text-xxs sm:text-xs">Percentage</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5 lg:mb-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-stone-800">{correctAnswers}</p>
              <p className="text-xs sm:text-sm text-stone-500">Correct</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-stone-800">{incorrectAnswers}</p>
              <p className="text-xs sm:text-sm text-stone-500">Wrong</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-stone-800">{unattemptedQuestions}</p>
              <p className="text-xs sm:text-sm text-stone-500">Skipped</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Details */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-stone-100 mb-4 sm:mb-5 lg:mb-6">
        <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-3 sm:mb-4">Exam Details</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-stone-50 rounded-lg sm:rounded-xl">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-stone-500">Total Questions</p>
              <p className="font-bold text-stone-800 text-sm sm:text-base">{totalQuestions}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-stone-50 rounded-lg sm:rounded-xl">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-stone-500">Time Taken</p>
              <p className="font-bold text-stone-800 text-sm sm:text-base">{formatTimeTaken(timeTaken)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-stone-50 rounded-lg sm:rounded-xl">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-stone-500">Attempted</p>
              <p className="font-bold text-stone-800 text-sm sm:text-base">{attemptedQuestions}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-stone-50 rounded-lg sm:rounded-xl">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-stone-500">Accuracy</p>
              <p className="font-bold text-stone-800 text-sm sm:text-base">{accuracy.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
