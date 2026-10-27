import type { DemoConfig } from './lib/types';

/** Main site the signup button sends people to */
export const MAIN_SITE_URL = 'https://railjee.in';

/** Demo shown when the URL has no (or an unknown) ?d= value */
export const DEFAULT_DEMO_ID = 'ccts';

export const MAX_QUESTIONS = 30;

/**
 * Every demo in src/demos/*.json. Each one becomes its own small chunk,
 * so a visitor only downloads the demo they open.
 */
const demoLoaders = import.meta.glob<DemoConfig>('./demos/*.json', { import: 'default' });

export async function loadDemo(requestedId: string | null): Promise<DemoConfig> {
  const path = `./demos/${requestedId}.json`;
  const loader = demoLoaders[path] ?? demoLoaders[`./demos/${DEFAULT_DEMO_ID}.json`];
  const demo = await loader();
  if (import.meta.env.DEV && demo.questions.length > MAX_QUESTIONS) {
    console.warn(`[demo] ${demo.id} has ${demo.questions.length} questions; max is ${MAX_QUESTIONS}`);
  }
  return demo;
}
