import logoUrl from '@/assets/logo.png';
import type { DemoConfig } from '@/lib/types';
import type { StoredHistory } from '@/lib/storage';
import { SignupHeaderButton } from './SignupCta';

interface StartCardProps {
  demo: DemoConfig;
  history: StoredHistory;
  /** Seconds left on a saved in-progress attempt, or null if there is none */
  resumeSeconds: number | null;
  resumeAnswered: number;
  onStart: () => void;
  onResume: () => void;
  onSignup: () => void;
}

/**
 * Demo-only replacement for the main site's long ExamInstructions page:
 * one tap to start, so the timer starts on the tap, not on page load.
 */
export default function StartCard({ demo, history, resumeSeconds, resumeAnswered, onStart, onResume, onSignup }: StartCardProps) {
  const { paper, copy, questions } = demo;
  const hasResume = resumeSeconds !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-orange-50/30 to-stone-100 flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
          <img src={logoUrl} alt="RailJee Logo" width={164} height={51} className="h-7 sm:h-10 w-auto" />
          <SignupHeaderButton onClick={onSignup} />
        </div>
      </header>

      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-xl p-3 sm:p-4 lg:p-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-5 sm:py-6 text-white bg-gradient-to-r from-orange-600 to-orange-500">
              <p className="text-xs sm:text-sm opacity-90 mb-1">{paper.name}</p>
              <h1 className="text-xl sm:text-2xl font-bold leading-snug">{copy.headline}</h1>
              <p className="text-xs sm:text-sm opacity-90 mt-2">{copy.subline}</p>
            </div>

            <div className="grid grid-cols-3 divide-x divide-stone-100 border-b border-stone-100 text-center">
              <Stat value={questions.length} label="Questions" />
              <Stat value={paper.durationMinutes} label="Minutes" />
              <Stat value={`−${paper.negativeMarking}`} label="Per wrong answer" />
            </div>

            <div className="p-4 sm:p-6 space-y-3">
              {hasResume ? (
                <>
                  <button
                    onClick={onResume}
                    data-track="exam_start"
                    className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-xl transition-all"
                  >
                    Continue ({resumeAnswered}/{questions.length} answered)
                  </button>
                  <button
                    onClick={onStart}
                    data-track="exam_start"
                    className="w-full py-3 bg-white border-2 border-stone-300 text-stone-700 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-stone-100 transition-all"
                  >
                    Start Over
                  </button>
                </>
              ) : (
                <button
                  onClick={onStart}
                  data-track="exam_start"
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:shadow-xl transition-all"
                >
                  ▶ Start Test Now
                </button>
              )}

              <ul className="text-xs sm:text-sm text-stone-500 space-y-1 pt-1">
                <li>• +1 for correct, −{paper.negativeMarking} for wrong</li>
                <li>• The timer starts when you tap Start</li>
                <li>• See your score and all answers at the end</li>
              </ul>

              {history.attempts > 0 && (
                <p className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
                  Attempts: {history.attempts} · Best score: {history.bestScore.toFixed(2)}/{questions.length}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="py-3 sm:py-4">
      <p className="text-lg sm:text-xl font-bold text-stone-800">{value}</p>
      <p className="text-xxs sm:text-xs text-stone-500">{label}</p>
    </div>
  );
}
