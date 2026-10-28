import logoUrl from '@/assets/logo.png';
import { SignupHeaderButton } from './SignupCta';

interface ResultHeaderProps {
  paperName: string;
  onSignup: () => void;
}

/** Copied from the main site's Navbar `examResult` variant; user menu replaced by a signup button */
export default function ResultHeader({ paperName, onSignup }: ResultHeaderProps) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-stone-800">Exam Completed</h1>
              <p className="text-xxs sm:text-xs text-stone-500">Paper: {paperName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <SignupHeaderButton onClick={onSignup} />
            <img src={logoUrl} alt="RailJee Logo" width={164} height={51} className="h-7 sm:h-10 w-auto" />
          </div>
        </div>
      </div>
    </header>
  );
}
