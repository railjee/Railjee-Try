// Facebook / Instagram open ad links in their own in-app browser (a WebView).
// Google blocks sign-in inside WebViews ("disallowed_useragent"), so "Sign up with
// Google" fails there. On Android we can hand the URL to Chrome with an intent link.

const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent);

export function isInAppBrowser(): boolean {
  return /FBAN|FBAV|FB_IAB|FB4A|Instagram|Messenger/i.test(ua());
}

export function isAndroid(): boolean {
  return /Android/i.test(ua());
}

export function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(ua());
}

/**
 * Android intent link that opens `target` in Chrome. If Chrome isn't installed,
 * Android opens `browser_fallback_url` instead (inside the same WebView).
 */
export function chromeIntentUrl(target: string): string {
  const u = new URL(target);
  return (
    `intent://${u.host}${u.pathname}${u.search}` +
    `#Intent;scheme=https;package=com.android.chrome;` +
    `S.browser_fallback_url=${encodeURIComponent(target)};end`
  );
}
