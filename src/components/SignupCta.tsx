interface SignupButtonProps {
  label?: string;
  onClick: () => void;
}

/** Small header button, shown on every screen except the running exam */
export function SignupHeaderButton({ label = 'Sign Up', onClick }: SignupButtonProps) {
  return (
    <button
      onClick={onClick}
      data-track="signup_start"
      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold text-xs sm:text-sm hover:shadow-lg transition-all"
    >
      {label}
    </button>
  );
}

interface SignupCardProps {
  title: string;
  buttonLabel: string;
  scoreText?: string;
  onClick: () => void;
}

/** Result-screen card: the strongest signup push */
export function SignupCard({ title, buttonLabel, scoreText, onClick }: SignupCardProps) {
  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 bg-gradient-to-br from-stone-800 to-stone-900 text-white shadow-lg">
      {scoreText && <p className="text-xs text-orange-300 font-semibold mb-1">{scoreText}</p>}
      <p className="text-base sm:text-lg font-bold leading-snug mb-3">{title}</p>
      <ul className="text-xs sm:text-sm text-stone-300 space-y-1 mb-4">
        <li>✓ Real previous-year papers (Hindi + English)</li>
        <li>✓ Result and answer review for every paper</li>
        <li>✓ Department-wise mock tests</li>
      </ul>
      <button
        onClick={onClick}
        data-track="signup_start"
        className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-base hover:shadow-xl transition-all"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

/** Sticky bottom bar on the result and review screens */
export function SignupStickyBar({ label, onClick }: SignupButtonProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-stone-200 px-3 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <p className="flex-1 text-xs sm:text-sm text-stone-600 leading-tight">Sign up to access the full paper</p>
        <button
          onClick={onClick}
          data-track="signup_start"
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm whitespace-nowrap"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
