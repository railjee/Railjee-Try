# CLAUDE.md: railjee-demo

Instructions for Claude (and humans) working in this repo. Read this first.

## What this repo is
A small **static** ad-landing site (`try.railjee.in`). A visitor from a Meta ad takes a
short sample test (10 questions) with the **same exam UI as railjee.in**, sees the
result and answer review, and is pushed to sign up on railjee.in.

- **Completely separate** from the RailJee main site (`RailJee/` frontend, `railji-backend/`).
  No imports, shared config, API calls or runtime dependency on them. The only link
  is the signup URL on railjee.in that the CTA points to.
- **Generic:** CCTS is just the first demo. A demo = one JSON file in `src/demos/`.
- Audience: railway staff (Assam / East India), Android phones, slow mobile data.
- **Language: UI text is English, same as the main site.** Only questions/options are
  bilingual (English + Hindi). A Hindi UI may come later; don't add Hindi UI text until then.

Key docs: `README.md` (how to run / add a demo / deploy), `PLAN.md` (original design and
decisions), `IMPLEMENTATION.md` (phase-by-phase log of what was built; keep it updated).

## Stack
Preact 10 (hooks from `preact/hooks`, no `preact/compat`) · Vite 6 · Tailwind CSS 3 ·
TypeScript (strict). No router, no state library, no UI kit, no web fonts, no KaTeX.

```bash
npm install
npm run dev      # http://localhost:5173  (?d=<demoId> picks a demo)
npm run dev:phone  # same, reachable from a phone on the same Wi-Fi (vite --host)
npm run build    # tsc --noEmit && vite build → dist/
npm run preview  # serve dist/
npm run publish:pages  # deploy to GitHub Pages (gh-pages branch)
```

## Layout
```
src/
  main.tsx            mount
  App.tsx             screen switching: start → exam → result → review; load/save attempt
  config.ts           MAIN_SITE_URL, DEFAULT_DEMO_ID, MAX_QUESTIONS, loadDemo()
  demos/<id>.json     demo data (paper info, Hindi copy, signup target, questions)
  components/
    ExamHeader, ExamQuestion, ExamActionBar, QuestionPalette,
    SubmitConfirmation, ExamResult, ExamResultActions, QuestionReview
                      ← COPIED from RailJee/src/components (see "Copied code")
    MathText          plain-text stand-in for the main site's KaTeX MathText
    ExamScreen        exam page (layout copied from RailJee ExamPageClient) + autosave
    StartCard         demo-only one-tap start screen (replaces ExamInstructions)
    ResultHeader      copy of the main Navbar "examResult" variant + signup button
    SignupCta         header button, result card, sticky bottom bar
    OpenInBrowserSheet  fallback sheet for Facebook/Instagram in-app browser
  hooks/              useExamState, useExamTimer, useExamSubmission ← COPIED
  lib/
    examTypes.ts, examUtils.ts  ← COPIED
    types.ts          Question/BilingualText (same shape as main site) + DemoConfig
    storage.ts        localStorage: resume, result, history
    signupUrl.ts      builds railjee.in signup URL (+ utm_*/fbclid passthrough)
    inAppBrowser.ts   FB/IG WebView detection + Chrome intent URL
    handoff.ts        what a signup tap does (normal / Android intent / help sheet)
    track.ts          tracking hook points (TODO: Meta Pixel)
  assets/logo.png     1.6 KB, imported in components (Vite inlines it into the JS)
public/
  favicon.png (main site favicon, compressed), _headers (Netlify cache rules)
scripts/
  publish-gh-pages.sh build + commit dist/ to the gh-pages branch (npm run publish:pages)
```

## Rules

### Copied code
Files marked COPIED came from the RailJee main site **once** and are owned here now.
- Keep their Tailwind class names unchanged so the look matches railjee.in.
- Allowed edits: imports (`react` → `preact/hooks`, `@/` paths), removing auth/API/Next.js
  bits, and small props needed by the demo. Mark demo additions with a `Demo addition`
  comment (examples: `restoreState`, `negativeMarking`, `backLabel`, `isTimeLow` = 2 min).
- To pull a UI change from the main site: copy the component again, re-apply those edits.

### Never add
- Calls to `api.railjee.in` or any backend, Supabase, or main-site packages.
- Heavy dependencies (UI kits, icon packs, KaTeX, analytics SDKs, web fonts).
  Performance budget: **≤ 50 KB gzipped first load** (HTML+CSS+JS+demo JSON, excluding the
  Pixel and logo). Check `npm run build` output.
- Meta Pixel / Conversions API code inside components. Wire tracking only in `lib/track.ts`.

### Demos
- One file per demo: `src/demos/<id>.json`, matching `DemoConfig` in `lib/types.ts`.
- 10 questions by default (about 48 s each for the timer), max 30 (`MAX_QUESTIONS`).
- **Bump `version`** whenever questions change; saved attempts for the old version are ignored.
- Answers ship in the bundle (public). Only use content that's OK to expose.
- Questions come from MongoDB `railji_prod_db.question-bank` (read-only export by `paperId`):
  map `correct` → `correctAnswer`, renumber `id` 1..N, keep the original id as `sourceId`.
  Prefer easy, well-known questions; put 2–3 of the easiest first.

### localStorage
Keys: `railjee-demo:<id>:v<version>:attempt` and `…:history`. All access goes through
`lib/storage.ts` (try/catch; the demo must work when storage is blocked).

### Signup handoff (important)
Ad clicks open in the Facebook/Instagram **in-app browser**, where Google blocks sign-in.
`lib/handoff.ts`: normal browser → plain link; FB/IG on Android → Chrome intent link,
help sheet if still visible after 1.5 s; FB/IG on iOS → help sheet. Keep this behaviour
for every signup button. Real-device testing is required after changing it.

### Tracking hook points
Events: `view`, `exam_start`, `exam_submit`, `result_view`, `review_open`, `signup_start`.
Call `track()`; elements also carry `data-track="<event>"`.

## Style
- Match surrounding code: functional components, small files, comments only where the
  "why" isn't obvious. Demo-specific copy (headline, CTA text) lives in the demo JSON.
- Mobile first. Test at 375px wide.

## Status / open items
See `IMPLEMENTATION.md` for the phase log and what's left (deploy, device testing,
Pixel wiring).
