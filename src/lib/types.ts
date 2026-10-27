// Question shapes match the main site (RailJee src/lib/types.ts) so a DB export drops straight in.

export interface BilingualText {
  en: string;
  hi: string;
}

export interface Question {
  id: number;
  /** Question id in the source paper (for traceability only) */
  sourceId?: number;
  question: BilingualText;
  options: BilingualText[];
  details?: BilingualText[];
  correctAnswer?: number;
}

export interface DemoConfig {
  id: string;
  /** Bump when questions change; old saved attempts are then ignored */
  version: number;
  source?: { paperId: string; note?: string };
  paper: {
    name: string;
    durationMinutes: number;
    negativeMarking: number;
    passPercentage: number;
  };
  copy: {
    headline: string;
    subline: string;
    ctaTitle: string;
    ctaButton: string;
  };
  signup: {
    path: string;
    redirect: string;
    utm: Record<string, string>;
  };
  questions: Question[];
}
