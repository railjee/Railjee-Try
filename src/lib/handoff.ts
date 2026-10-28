import { chromeIntentUrl, isAndroid, isInAppBrowser } from './inAppBrowser';
import { track } from './track';

/** How long to wait for the jump to Chrome before showing the help sheet */
const FALLBACK_DELAY_MS = 1500;

/**
 * Sends the visitor to the signup page in a browser where Google sign-in works.
 * - Normal browser: plain navigation.
 * - FB/IG in-app browser on Android: jump straight to Chrome via an intent link;
 *   if we're still visible after a moment, the jump didn't happen → `showHelp`.
 * - FB/IG in-app browser on iOS: no reliable way to force Safari → `showHelp`.
 */
export function startSignup(target: string, showHelp: (target: string) => void, source: string) {
  track('signup_start', { source });

  if (!isInAppBrowser()) {
    window.location.href = target;
    return;
  }

  if (isAndroid()) {
    window.location.href = chromeIntentUrl(target);
    window.setTimeout(() => {
      if (document.visibilityState === 'visible') showHelp(target);
    }, FALLBACK_DELAY_MS);
    return;
  }

  showHelp(target);
}
