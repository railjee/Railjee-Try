// Saves the visitor's attempt in localStorage so a reload, a dropped connection or
// coming back later resumes the exam or shows the last result.
// Every access is wrapped in try/catch: storage can be blocked (private mode, some
// in-app browsers) and the demo must still work without it.

import type { RestorableExamState, SubmissionResult } from './examTypes';

export interface StoredAttempt extends RestorableExamState {
  status: 'in_progress' | 'submitted';
  startedAt: number;
  /** Seconds left on the timer when last saved */
  timeRemaining: number;
  /** Wall-clock time of the last save, used to work out time spent away */
  savedAt: number;
  result?: SubmissionResult;
}

export interface StoredHistory {
  attempts: number;
  bestScore: number;
  lastScore: number;
}

const PREFIX = 'railjee-demo';

const attemptKey = (demoId: string, version: number) => `${PREFIX}:${demoId}:v${version}:attempt`;
const historyKey = (demoId: string, version: number) => `${PREFIX}:${demoId}:v${version}:history`;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the demo keeps working, it just won't resume.
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function loadAttempt(demoId: string, version: number): StoredAttempt | null {
  return read<StoredAttempt>(attemptKey(demoId, version));
}

export function saveAttempt(demoId: string, version: number, attempt: StoredAttempt) {
  write(attemptKey(demoId, version), { ...attempt, savedAt: Date.now() });
}

export function clearAttempt(demoId: string, version: number) {
  remove(attemptKey(demoId, version));
}

export function loadHistory(demoId: string, version: number): StoredHistory {
  return read<StoredHistory>(historyKey(demoId, version)) ?? { attempts: 0, bestScore: 0, lastScore: 0 };
}

export function recordResult(demoId: string, version: number, score: number): StoredHistory {
  const prev = loadHistory(demoId, version);
  const next: StoredHistory = {
    attempts: prev.attempts + 1,
    bestScore: prev.attempts === 0 ? score : Math.max(prev.bestScore, score),
    lastScore: score,
  };
  write(historyKey(demoId, version), next);
  return next;
}

/** Seconds left for an in-progress attempt, counting the time the visitor was away. */
export function remainingTime(attempt: StoredAttempt): number {
  const awaySeconds = Math.floor((Date.now() - attempt.savedAt) / 1000);
  return Math.max(0, attempt.timeRemaining - awaySeconds);
}
