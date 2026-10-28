import { MAIN_SITE_URL } from '@/config';
import type { DemoConfig } from './types';

// Params copied from the demo URL to railjee.in so the signup can be attributed to the ad.
const PASSTHROUGH = /^(utm_[a-z]+|fbclid)$/;

/**
 * Builds the railjee.in signup URL for a demo:
 * redirect + the demo's default UTM tags, overridden by any utm_* / fbclid on the
 * current URL, plus demo id and score for context.
 */
export function buildSignupUrl(demo: DemoConfig, score?: { value: number; total: number }): string {
  const url = new URL(demo.signup.path, MAIN_SITE_URL);
  url.searchParams.set('redirect', demo.signup.redirect);

  for (const [key, value] of Object.entries(demo.signup.utm)) {
    url.searchParams.set(key, value);
  }

  const current = new URLSearchParams(window.location.search);
  current.forEach((value, key) => {
    if (PASSTHROUGH.test(key)) url.searchParams.set(key, value);
  });

  url.searchParams.set('demo', demo.id);
  if (score) url.searchParams.set('score', `${score.value}/${score.total}`);

  return url.toString();
}
