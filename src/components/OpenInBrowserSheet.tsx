import { useState } from 'preact/hooks';
import { chromeIntentUrl, isAndroid } from '@/lib/inAppBrowser';

interface OpenInBrowserSheetProps {
  target: string;
  onClose: () => void;
}

/**
 * Fallback shown inside the Facebook/Instagram in-app browser when we couldn't
 * jump to Chrome automatically (always on iOS). Email signup still works here.
 */
export default function OpenInBrowserSheet({ target, onClose }: OpenInBrowserSheetProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(target);
    } catch {
      // Older WebViews: fall back to a hidden textarea
      const el = document.createElement('textarea');
      el.value = target;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    setCopied(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 pb-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-4 sm:hidden" />
        <h2 className="text-base font-bold text-stone-800 mb-1">Open in your browser to sign up with Google</h2>
        <p className="text-xs text-stone-500 mb-4">Google sign-in doesn't work inside the Facebook app.</p>

        <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl mb-4">
          <span className="text-xl leading-none font-bold text-orange-600">⋮</span>
          <p className="text-sm text-stone-700">
            Tap <b>⋮</b> or <b>···</b> in the top corner, then choose <b>“Open in browser”</b> / <b>“Open in Chrome”</b>.
          </p>
        </div>

        <div className="space-y-2.5">
          {isAndroid() && (
            <a
              href={chromeIntentUrl(target)}
              data-track="signup_start"
              className="block w-full py-3 text-center bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-semibold"
            >
              Open in Chrome
            </a>
          )}
          <button
            onClick={copyLink}
            className="w-full py-3 bg-white border-2 border-stone-300 text-stone-700 rounded-xl font-semibold"
          >
            {copied ? '✓ Link copied' : 'Copy link'}
          </button>
          <a
            href={target}
            data-track="signup_start"
            className="block w-full py-2.5 text-center text-sm font-semibold text-orange-700 underline"
          >
            Sign up with email instead
          </a>
        </div>
      </div>
    </div>
  );
}
