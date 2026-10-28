# Implementation log

Phase-by-phase record of what was built, decisions made on the way, and what's left.
Update this file when you change the demo.

---

## Phase 1: Scaffold and port the exam UI ✅ (2026-10-28)

**Done**
- Separate repo `railjee-demo` (own `git init`, branch `main`, nothing committed yet).
- Vite 6 + Preact 10 + Tailwind 3 + TypeScript. Configs: `vite.config.ts` (`@` → `/src`),
  `tailwind.config.js` (adds the main site's `xxs` font size), `postcss.config.js`.
- Copied from RailJee main site (`RailJee/src`), then owned here:
  - `components/exam/*` → `ExamHeader`, `ExamQuestion`, `ExamActionBar`, `QuestionPalette`,
    `SubmitConfirmation`, `ExamResult`, `ExamResultActions`
  - `components/QuestionReview.tsx`
  - `hooks/useExamState.ts`, `useExamTimer.ts`, `useExamSubmission.ts`
  - `lib/examTypes.ts`, `lib/examUtils.ts`
- Edits to copied files (class names untouched):
  - `react` → `preact/hooks`; removed `'use client'`
  - `QuestionReview`: removed Supabase, `UserMenu`, `next/link`
  - `MathText`: plain-text stand-in (no KaTeX)
  - Demo additions: `useExamState.restoreState`, `ExamQuestion.negativeMarking`,
    `ExamResultActions.backLabel`, `isTimeLow` threshold 5 min → 2 min, logo path/size
- Styles: system fonts only; `.font-hindi` maps to Noto Sans Devanagari / Nirmala UI / Mangal;
  animation keyframes copied from main `globals.css`.

**First demo data: `src/demos/ccts.json`**
- Source: `paper-UauClV`, CCTS PQ Exam Paper (NR, CCTS Level 6, 2025, 110 questions).
- 15 easy, well-known questions picked (source ids, in order):
  107 Hindi Divas · 38 IRCTC · 60 RAC · 42 Rail Madad · 21 ATVM · 24 NTES ·
  89 Vande Bharat · 18 ARP · 8 Demurrage · 88 Without ticket (reserved) ·
  61 Luggage allowance · 29 Kisan Rail · 32 OSOP · 108 Eighth Schedule · 97 Maternity leave
- Answer positions spread A×4, B×4, C×4, D×3.
- 12 minutes, −0.33 negative marking, pass 70% (same as the real paper).
- Skipped on purpose: source questions whose answer key looks doubtful
  (59 senior citizen concession, 70 dynamic pricing, 81 duty pass metal). Worth checking
  in the main question bank.

## Phase 2: App flow and saved progress ✅ (2026-10-28)

**Done**
- `App.tsx`: screens `start → exam → result → review`.
- `StartCard`: one-tap start; resume button with answered count; attempt history line.
- `ExamScreen`: same layout as main `ExamPageClient`; scoring with the copied
  `useExamSubmission` (marking from demo JSON); auto-submit at 0.
- `lib/storage.ts`:
  - attempt saved on every answer / flag / navigation, timer every 5 s, and on
    `pagehide` / `visibilitychange`
  - reload during exam → start card shows **जारी रखें**; time spent away is subtracted
  - time ran out while away → exam reopens with 0 s and auto-submits the saved answers
  - after submit → reopening shows the result; **Retry** clears the attempt, keeps history
  - keys versioned per demo: `railjee-demo:<id>:v<version>:attempt|history`
- Result screen: `ResultHeader` (copy of main "examResult" navbar) + `ExamResult` +
  signup card + Review / Retry. Review screen: copied `QuestionReview`.

## Phase 3: Signup handoff and tracking hooks ✅ (2026-10-28)

**Done**
- `lib/signupUrl.ts`: `https://railjee.in/auth/signup?redirect=/departments/commercial`
  + demo UTM defaults, overridden by `utm_*` on the current URL, + `fbclid`, `demo`, `score`.
- `lib/inAppBrowser.ts` + `lib/handoff.ts`:
  - normal browser → plain link
  - FB/IG in-app browser on Android → `intent://…;package=com.android.chrome;S.browser_fallback_url=…`;
    if the page is still visible after 1.5 s → `OpenInBrowserSheet`
  - FB/IG on iOS → `OpenInBrowserSheet`
- `OpenInBrowserSheet`: Chrome button (Android), "⋮ → open in browser" hint, copy link,
  email signup link.
- `SignupCta`: header button (start, result, review), result card, sticky bottom bar.
  No signup prompts during the running exam (finishing drives signups).
- `lib/track.ts`: `view`, `exam_start`, `exam_submit`, `result_view`, `review_open`,
  `signup_start` with `data-track` attributes. Pixel calls are TODOs.

## Verification so far (2026-10-28)
- `npm run build` passes (tsc strict + vite). Output gzipped: JS 19.3 KB + demo 3.3 KB +
  CSS 5.8 KB + HTML 0.5 KB ≈ **29 KB**, plus logo 11 KB.
- In the browser at 375 px wide (dev server):
  - start card → exam → answered 3 → reload → resume at Q4 with 3 answers and the timer continuing ✅
  - flag, skip, palette counts, submit popup (14 answered / 1 skipped / 1 flagged) ✅
  - result: 12 correct, 2 wrong, 1 skipped → 11.34 (76%), pass ✅
  - review filters and answer highlighting ✅
  - reload after submit → result screen ✅
  - signup URL carries `utm_campaign` override + `fbclid` ✅
  - Android FB user agent → in-app detected, intent URL built correctly ✅
  - iOS FB user agent → fallback sheet shown ✅
- **Not verified yet:** Retry button click in the browser; real Android/Facebook device
  behaviour of the intent link; Lighthouse score; deployment.

## Change: English UI (2026-10-28)
- Per decision: UI text is English like the main site; only questions/options stay
  bilingual. Converted start card, signup buttons/card/bar, in-app browser sheet, result
  texts, page `<title>`/`lang`, and demo `copy`. Removed `paper.nameHi`. Build re-checked.

## Change: 10 questions, 8 minutes, smaller logo, phone testing (2026-10-28)
- Demo cut to **10 questions** (15 felt long for ad visitors). Kept source ids:
  107 Hindi Divas · 38 IRCTC · 60 RAC · 42 Rail Madad · 21 ATVM · 24 NTES ·
  89 Vande Bharat · 8 Demurrage · 88 Without ticket (reserved) · 29 Kisan Rail.
  Dropped: 18 ARP, 61 Luggage allowance, 32 OSOP, 108 Eighth Schedule, 97 Maternity leave.
  Answer positions A×3, B×2, C×3, D×2.
- Timer **8 minutes** (same ~48 s per question). `version` bumped to 2, so saved v1 attempts are ignored.
- Logo: 11 KB PNG → **1.6 KB** 64-colour PNG (same 164×51 size, visually unchanged).
  WebP was larger (4.6–5.5 KB) for this flat logo.
- Build now ≈ 27 KB gzipped (JS 18.8 + demo 2.4 + CSS 5.8 + HTML 0.4) + 1.6 KB logo.
- `npm run dev:phone` / `npm run preview:phone` serve on the local network (`vite --host`).

## Change: favicon, relative paths, GitHub Pages publishing (2026-10-28)
- Favicon: the main site favicon (`RailJee/public/images/favicon.png`, 5.3 KB) compressed
  to **860 B** (64-colour PNG, native 50×50) → `public/favicon.png`.
- Logo moved to `src/assets/logo.png` and imported; Vite inlines it into the JS (no extra request).
- `base: "./"` in `vite.config.ts`: relative asset paths for GitHub Pages project URLs.
- `scripts/publish-gh-pages.sh` (`npm run publish:pages`): build → commit `dist/` (+ `.nojekyll`,
  optional `CNAME`) to the orphan `gh-pages` branch via a temporary index → push.

---

## Phase 4: Deploy and real-device testing ⏳ (next)
- [x] GitHub repo (`railjee/Railjee-Try`), phase commits, `gh-pages` build branch
- [ ] Enable GitHub Pages from `gh-pages`; domain `try.railjee.in` (DNS CNAME + `CNAME=` publish)
- [ ] Real-device tests (see README checklist), especially the Facebook in-app → Chrome jump
- [ ] Lighthouse mobile / Slow 4G
- [ ] Point the ad at `https://try.railjee.in/?d=ccts&utm_campaign=…`

## Later / ideas
- Wire Meta Pixel in `lib/track.ts` when the tracking helpers are ready.
- Possible speed-up: bundle the default demo into the main JS (saves one request) if
  only one demo is live.
- railjee.in signup page could read `demo` + `score` to show "your score 11.34/15, sign up
  to save it" (main-site work, tracked separately).
