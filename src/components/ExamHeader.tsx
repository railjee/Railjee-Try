import logoUrl from '@/assets/logo.png';
import { formatTime, isTimeLow } from '@/lib/examUtils';
import { ExamHeaderProps } from '@/lib/examTypes';

export default function ExamHeader({
  examName,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  answeredCount,
  onShowPalette,
  onSubmit
}: ExamHeaderProps) {
  return (
    <div className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between">
          {/* Left - Logo & Title */}
          <div className="flex items-center gap-2">
            <img
              src={logoUrl}
              alt="RailJee Logo"
              width={164}
              height={51}
              className="h-7 sm:h-10 w-auto"
            />
            <div className='pl-2'>
              <h1 className="text-xxs sm:text-xs font-semibold text-stone-700 leading-tight">
                {examName}
              </h1>
              <p className="text-xxs sm:text-xs text-stone-500">
                Q {currentQuestionIndex + 1}/{totalQuestions}
              </p>
            </div>
          </div>

          {/* Right - Timer, Grid & Submit */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Timer */}
            <TimerDisplay time={timeRemaining} isLowTime={isTimeLow(timeRemaining)} />

            {/* Question Palette Toggle */}
            <button
              onClick={onShowPalette}
              className="p-1.5 sm:p-2 hover:bg-stone-100 rounded-lg transition-all relative border border-stone-200"
            >
              <GridIcon />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {answeredCount}
              </span>
            </button>

            {/* Submit Button - Desktop only */}
            <button
              onClick={onSubmit}
              className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold text-xs sm:text-sm hover:shadow-lg transition-all"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-stone-200">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Sub-components

interface TimerDisplayProps {
  time: number;
  isLowTime: boolean;
}

function TimerDisplay({ time, isLowTime }: TimerDisplayProps) {
  return (
    <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xxs sm:text-xs font-bold ${
      isLowTime ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-700'
    }`}>
      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{formatTime(time)}</span>
    </div>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={1.5} />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={1.5} />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={1.5} />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={1.5} />
    </svg>
  );
}
