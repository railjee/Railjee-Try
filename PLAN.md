# RailJee Demo: Build Plan

A small, static, ad-landing site where a visitor takes one short sample paper
(10 questions) with the **same exam UI as railjee.in**, sees their result and
the answer review, and is then moved to sign up on railjee.in.

It is generic: CCTS is only the first demo. A new demo is a new JSON file plus
a new ad link, with no code changes.

- **URL:** `try.railjee.in` (example: `try.railjee.in/?d=ccts`)
- **Repo:** `railjee-demo`, a **completely separate repository**. It does not
  import, build with, or call anything from the RailJee frontend or backend.
  The exam UI is copied once and then owned here. The only link to the main
  site is the signup URL on railjee.in that the CTA points to.
- **Language (decided later):** UI text is English like the main site; only questions are
  bilingual. Hindi UI strings shown in this plan were replaced with English when built.
- **Later decision:** demo cut to 10 questions / 8 minutes (see `IMPLEMENTATION.md`).
- **Status:** phases 1–3 built (see `IMPLEMENTATION.md`); phase 4 (deploy, device testing) next.

---

## 1. Goals and success measures

| Goal | Measure |
|---|---|
| The visitor starts the test right away | Ad click to first answer, with no login and no backend |
| Fast on slow mobile data | First load ≤ 50 KB gzipped; usable < 3 s on "Slow 4G" throttling |
| Same look and feel as the main site | Header, question card, palette, submit popup, result and review match railjee.in |
| Move people to sign up | Signup button always visible; strongest push on the result screen; works inside the Facebook/Instagram in-app browser |
| Easy to swap demos | Adding a demo = adding `src/demos/<id>.json` |

Out of scope: Meta Pixel / Conversions API code (another session owns it; we
only leave hook points), analytics tools, backend changes.

---

## 2. Where it lives and how it deploys

- **Own Git repo** (`railjee-demo`, local folder next to `RailJee/`, not inside it).
  Needs a new GitHub repo when you're ready. No shared packages, no shared
  config, no API calls to `api.railjee.in`.
- **Own Netlify site** connected to that repo:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Domain: `try.railjee.in` (one CNAME record at the DNS provider)
- Main-site deploys and demo deploys never affect each other.

---

## 3. Stack

| Piece | Choice | Why |
|---|---|---|
| UI | **Preact 10 + `preact/compat`** (~4 KB) | Main-site exam components copy over almost line for line (same JSX and hooks) |
| Build | **Vite** (`@preact/preset-vite`) | Dev server, minify, hashed file names; nothing extra shipped to the browser |
| Styles | **Tailwind CSS v3** (same as the main site) | Same class names, so the design matches; only used classes are emitted (~10 KB) |
| Language | TypeScript | Same as the main site; types copied from `src/lib/types.ts` |
| Fonts | **System fonts only** | Android ships Noto Sans Devanagari, so Hindi renders with no download. This is the single biggest saving vs. the main site's 3 Google fonts |
| Icons | Inline SVG (already inline in the exam components) | No icon library |
| Math | **No KaTeX** unless a demo needs it | KaTeX JS + CSS + fonts is the heaviest optional dependency |

No router, no state library, no UI kit. Screens are switched with one
`screen` state value.

---

## 4. Folder structure

```
railjee-demo/
  PLAN.md                 this file
  README.md               how to run, add a demo, deploy
  package.json            preact, vite, @preact/preset-vite, tailwindcss, postcss, autoprefixer, typescript
  vite.config.ts          preact preset; alias react → preact/compat
  tailwind.config.js      colors / fontSize (xxs) copied from RailJee/tailwind.config.ts
  postcss.config.js
  tsconfig.json
  index.html              <html lang="hi">, meta viewport, theme-color, inline logo, <div id="app">
  public/
    _headers              long cache for /assets/*, no-cache for index.html
    logo.svg|png          RailJee logo (current logo.png is 11 KB; an SVG or WebP version would be smaller)
  src/
    main.tsx              mount <App/>
    App.tsx               loads the demo config, picks the screen (start | exam | result | review)
    config.ts             DEFAULT_DEMO_ID, MAIN_SITE_URL, version
    types.ts              Question, BilingualText, DemoConfig, StoredAttempt (copied/trimmed from main)
    demos/
      ccts.json           first demo (15 questions + answers + copy)
    components/           ← copied from RailJee/src/components/exam/*, auth bits removed
      StartCard.tsx       new, small (replaces the long ExamInstructions page)
      ExamHeader.tsx
      ExamQuestion.tsx
      ExamActionBar.tsx
      QuestionPalette.tsx
      SubmitConfirmation.tsx
      ExamResult.tsx
      QuestionReview.tsx
      SignupCta.tsx       new: sticky bar + result-screen card
      OpenInBrowserSheet.tsx  new: fallback sheet for in-app browsers (section 8)
    hooks/                ← copied from RailJee/src/hooks
      useExamState.ts
      useExamTimer.ts
      useExamSubmission.ts   (already scores locally, so no API needed)
      useQuestionReview.ts   (from useExamState.ts)
    lib/
      examUtils.ts        copied (formatTime, isTimeLow, filterQuestions, counts)
      storage.ts          new: localStorage resume / result / history (section 7)
      inAppBrowser.ts     new: detect FB/IG webview, build intent:// URL (section 8)
      signupUrl.ts        new: builds the railjee.in signup URL with UTM + fbclid passthrough
      track.ts            new: hook points with TODOs (section 9)
    styles.css            @tailwind base/components/utilities
```

Copy rule: the files marked "copied" are copied **once** from the main site
into this repo and owned here from then on (no import or link back). When
copying, change only (a) import paths,
(b) remove Supabase / `UserMenu` / `next/link` / `next/navigation`, and
(c) remove anything that calls the API. Keep class names unchanged so the look
stays identical and future main-site changes can be copied across.

---

## 5. Demo data format

`src/demos/<id>.json` uses the **same question shape as the main site**
(`RailJee/src/lib/types.ts`), so an export from the DB drops straight in.

```jsonc
{
  "id": "ccts",
  "version": 1,                       // bump when questions change → old saved results are ignored
  "paper": {
    "name": "CCTS Mock Test – 1",
    "nameHi": "CCTS मॉक टेस्ट – 1",
    "durationMinutes": 12,            // see "Length and timer" below
    "negativeMarking": 0.33,          // marks deducted per wrong answer
    "passPercentage": 70
  },
  "copy": {                           // ad-matched text shown on the start card and CTA
    "headline": "CCTS परीक्षा की तैयारी",
    "subline": "असली पिछले साल के प्रश्न · मुफ़्त · लॉगिन की ज़रूरत नहीं",
    "ctaTitle": "और CCTS पेपर अनलॉक करें",
    "ctaButton": "मुफ़्त साइन अप करें"
  },
  "signup": {
    "redirect": "/departments/commercial",   // where railjee.in sends them after signup
    "utm": { "utm_source": "meta", "utm_medium": "paid", "utm_campaign": "ccts_demo" }
  },
  "questions": [
    {
      "id": 1,
      "question": { "en": "…", "hi": "…" },
      "options": [ { "en": "…", "hi": "…" }, { "en": "…", "hi": "…" }, { "en": "…", "hi": "…" }, { "en": "…", "hi": "…" } ],
      "details": [ { "en": "…", "hi": "…" } ],
      "correctAnswer": 2
    }
  ]
}
```

- 15 questions per demo by default (max 30, checked when the demo loads; a warning in dev).
- The JSON is bundled into the JS at build time, so there's no extra request
  after the page loads. The selected demo is code-split so only that one
  demo's questions download.
- Answers are public in the bundle. Only use free / sample content.
- Picking a demo: `?d=<id>`; unknown or missing id → `DEFAULT_DEMO_ID`.

**Getting the questions:** read-only query on MongoDB
`railji_prod_db.question-bank` by `paperId` (access confirmed), pick 15
questions, map `correct` → `correctAnswer`, write `src/demos/<id>.json`.
This is a one-time export done while building; the site never talks to the DB.

### Length and timer
- **15 questions, 12 minutes** (≈ 48 s per question), configurable per demo.
- Why 15: an ad visitor needs to *finish* to see the result screen, and the
  result screen is where we ask for signup. 30 questions loses most people
  halfway. 15 is still long enough to feel like a real test.
- Why 12 rather than 10: every question has English + Hindi text and is read
  on a phone. 10 minutes (40 s each) works if the chosen questions are short.
  The timer is there for realism, not to time people out before they finish.
- Keep the real paper's negative marking (−0.33) so the result feels authentic.
- Question choice: mix of topics from the paper; put 2–3 easier ones first
  so people get going.

---

## 6. Screens and features (copied from the main site)

### 6.1 Start card (new, replaces the long instructions page)
- RailJee logo, demo headline / subline (Hindi from `copy`)
- "15 प्रश्न · 12 मिनट · गलत उत्तर पर −0.33" (from the demo JSON)
- One big **शुरू करें** button. The timer starts on this tap, not on page load,
  so slow-loading visitors don't lose time.
- If a saved in-progress attempt exists: **जारी रखें** (resume) + "नया शुरू करें".
- If a saved result exists: go straight to the result screen (section 7).
- Small "साइन अप" link in the header (signup is always visible).

### 6.2 Exam screen: `ExamHeader` (sticky)
- RailJee logo, paper name, `Q 3/30`
- Countdown timer, turns red when time is low (`isTimeLow`)
- Question-grid button with answered-count badge → opens palette
- Submit button (desktop; on mobile, submit comes from the action bar / palette)
- Orange progress bar under the header

### 6.3 Exam screen: `ExamQuestion`
- Question number, English text with the Hindi line below (`font-hindi` mapped to system Devanagari)
- Options A–D with the Hindi line, selected state, tap to select / change
- "Flag for Review" toggle
- Details block when the question has `details`

### 6.4 Exam screen: `ExamActionBar`
- Previous (disabled on Q1) · Next → becomes **Submit** on the last question

### 6.5 `QuestionPalette`
- Desktop: side panel. Mobile: bottom sheet with close button.
- Numbered grid, colour by status: current / answered / skipped / flagged / not visited
- Counts + legend; tap a number to jump

### 6.6 `SubmitConfirmation` popup
- Answered / skipped / for-review / not-visited counts
- Mini question overview, tap to jump back
- **Review** (close) and **Submit** buttons
- Auto-submit when the timer hits 0 (same as the main site)

### 6.7 `ExamResult`
- Score (with negative marking), percentage, accuracy, pass/fail vs `passPercentage`
- Correct / wrong / skipped / attempted / total, time taken
- Buttons: **उत्तर देखें** (review) · **फिर से दें** (retry)
- **SignupCta card**: "आपका स्कोर 9/15 · और CCTS पेपर अनलॉक करें → मुफ़्त साइन अप करें"
- Attempt info from local history: "प्रयास 2 · सर्वश्रेष्ठ 11/15"

### 6.8 `QuestionReview`
- Filters: All / Correct / Wrong / Skipped with counts
- Your answer vs correct answer highlighted, details shown
- Previous / Next, palette coloured correct / wrong / skipped
- Back to result; sticky signup bar stays visible

### 6.9 Signup visibility
- Header: small **साइन अप** button on every screen.
- During the exam: no extra banners, so nothing distracts from finishing (finishing is what drives signups).
- Result and review: sticky bottom bar + result card (strongest push).

**Left out on purpose:** Exam/Practice mode selection (demo is exam mode
only), attempt history from the server, user menu, Razorpay, KaTeX.

---

## 7. Saving progress (localStorage)

Key per demo and version: `railjee-demo:<id>:v<version>`.
A new demo, or bumping `version`, never shows stale data.

```ts
type StoredAttempt = {
  status: 'in_progress' | 'submitted';
  startedAt: number;
  currentIndex: number;
  answers: (number | null)[];
  markedForReview: boolean[];
  visited: number[];
  timeRemaining: number;        // seconds
  result?: SubmissionResult;    // when submitted
};
type StoredHistory = { attempts: number; bestScore: number; lastScore: number };
```

| Moment | Behaviour |
|---|---|
| Any answer / flag / navigation | Save the attempt. The timer value is saved at most every 5 s and on `visibilitychange` / `pagehide` |
| Reload or come back during the exam | Start card shows **जारी रखें**; resume with the saved time left |
| Time ran out while away | Auto-submit on load using the saved answers |
| Submit | Save `result`, update history (attempts +1, best score) |
| Open the link again after submitting | Go straight to the result screen (review, retry, signup) |
| Retry | Clear the attempt, keep history, back to the start card |

All storage access goes through `lib/storage.ts`, wrapped in try/catch. If
storage is blocked (private mode, some webviews), the demo still works without
saving.

**Known limit:** the Facebook/Instagram in-app browser keeps its own storage,
separate from Chrome, and may clear it. A result saved there isn't visible in
Chrome. That's acceptable: the result is shown right after submit, which is
when we ask for signup.

---

## 8. Signup handoff and the in-app browser problem

### The problem
Ad clicks in the Facebook / Instagram app open in their **in-app browser** (an
Android WebView). Google blocks OAuth sign-in in embedded WebViews
(`403 disallowed_useragent`). So **"Sign up with Google" fails** there, and
visitors won't figure out "open in Chrome" on their own. Email signup does work
in the WebView, but needs an email-verification round trip.

### Detection (`lib/inAppBrowser.ts`)
User-agent check, no library:
- Facebook: `FBAN` / `FBAV` / `FB_IAB` / `FB4A`
- Instagram: `Instagram`
- (optional) Messenger: `Messenger` / `FBAN/MessengerForiOS`
- Platform: `/Android/i` vs `/iPhone|iPad/i`

### What the signup button does

| Visitor is in… | Tap on "मुफ़्त साइन अप करें" |
|---|---|
| Normal browser (Chrome, Samsung Internet, Safari) | Plain link to `https://railjee.in/auth/signup?...` |
| **FB/IG in-app browser on Android** (most of our traffic) | **Jump straight to Chrome** with an Android intent link (below). No extra step for the user |
| FB/IG in-app browser on iOS | Show `OpenInBrowserSheet` (iOS has no reliable way to force Safari) |
| Jump to Chrome didn't happen (still visible after ~1.5 s) | Show `OpenInBrowserSheet` as fallback |

**Android intent link**: opens the URL in Chrome from inside the WebView,
triggered by the user's tap:

```ts
// target = https://railjee.in/auth/signup?redirect=/departments/commercial&utm_source=meta&...&fbclid=...
function chromeIntentUrl(target: string): string {
  const u = new URL(target);
  return `intent://${u.host}${u.pathname}${u.search}` +
    `#Intent;scheme=https;package=com.android.chrome;` +
    `S.browser_fallback_url=${encodeURIComponent(target)};end`;
}

function onSignupTap(target: string) {
  track('signup_start');
  if (isInAppBrowser() && isAndroid()) {
    window.location.href = chromeIntentUrl(target);
    // If we're still visible after 1.5 s, the jump didn't happen → show the help sheet
    setTimeout(() => {
      if (document.visibilityState === 'visible') showOpenInBrowserSheet(target);
    }, 1500);
  } else if (isInAppBrowser()) {
    showOpenInBrowserSheet(target);   // iOS
  } else {
    window.location.href = target;
  }
}
```

- `package=com.android.chrome` targets Chrome; nearly all Android phones in
  India have it. If Chrome is missing, `browser_fallback_url` opens the normal
  link (inside the WebView, where email signup still works).
- Facebook may show its own "Leave Facebook?" confirm. That's one tap, and
  still far better than asking the user to find the ⋮ menu.
- **This is not guaranteed across every FB/IG app version.** It must be tested
  on real devices before relaunch (section 11). The fallback sheet covers the
  cases where it fails.

**`OpenInBrowserSheet`** (fallback, bottom sheet, Hindi first):
- **Chrome में खोलें** button (retries the intent on Android)
- Visual hint: arrow to the ⋮ / ··· menu → "ब्राउज़र में खोलें" / "Open in browser"
- **लिंक कॉपी करें** (copy link) button
- **ईमेल से साइन अप करें**: opens the normal signup URL in the WebView (email works there)

### Keeping attribution and context across the jump
`signupUrl.ts` copies these from the demo URL onto the railjee.in URL:
`utm_*`, `fbclid`, plus `demo=<id>` and `score=<n>/<total>`. This lets the
Pixel on railjee.in attribute the signup (the tracking session handles the
Pixel side), and lets the signup page later show "Your score 18/30, sign up to
save it" (optional, phase 3).

---

## 9. Tracking hook points (no Pixel code here)

`lib/track.ts` exports one function. Each call site also gets a
`data-track="…"` attribute on the element.

```ts
export type DemoEvent = 'view' | 'exam_start' | 'exam_submit' | 'result_view' | 'review_open' | 'signup_start';
export function track(event: DemoEvent, data?: Record<string, unknown>) {
  // TODO(pixel): call the tracking helpers from the tracking branch, e.g.
  //   view → trackViewContent(), signup_start → trackLead() / InitiateCheckout-style event.
  if (import.meta.env.DEV) console.debug('[track]', event, data);
}
```

| Hook | Where |
|---|---|
| `view` | App mount (page view) |
| `exam_start` | शुरू करें tap ("paper or test opened") |
| `exam_submit` / `result_view` | Submit confirmed / result shown, with score |
| `review_open` | उत्तर देखें |
| `signup_start` | Every signup button / CTA tap, before the redirect |

Loading the Pixel script itself (≈ 90 KB) must happen **after** page load, not
in `<head>`. Note for the tracking session.

---

## 10. Performance budget and checklist

- [ ] First load ≤ 50 KB gzipped (HTML + CSS + JS + selected demo JSON), excluding the Pixel
- [ ] CSS inlined or a single small file; JS `type="module"` (deferred by default)
- [ ] No web fonts; system stack incl. `"Noto Sans Devanagari"` for Hindi
- [ ] Logo as SVG or WebP, with width/height set (no layout shift)
- [ ] No images other than the logo
- [ ] `public/_headers`: `/assets/*` → `Cache-Control: public, max-age=31536000, immutable`; `/index.html` → `no-cache`
- [ ] Lighthouse mobile ≥ 90 performance; check with Chrome DevTools "Slow 4G"
- [ ] Works with JS from cache on a flaky network (resume from storage)

---

## 11. Main site (railjee.in): handled elsewhere

Main-site issues are tracked and fixed in a **separate session**, not in this
repo. The demo works as-is either way; these two main-site items only make the
funnel smoother after the handoff:
- Signup page respecting `?redirect=` (today it ignores it, so new users land on `/`).
- Signup page handling the FB/IG in-app browser (Google sign-in fails there).

---

## 12. Build phases

**Phase 1: Scaffold and port UI (≈ ½ day)**
1. Vite + Preact + Tailwind scaffold; copy Tailwind theme bits.
2. Copy exam components and hooks; remove auth/API/Next imports.
3. `ccts.json`: export 15 questions from MongoDB once the paper ID is chosen.

**Phase 2: Flow and storage (≈ ½ day)**
5. App screen switching: start → exam → submit → result → review.
6. `storage.ts`: resume, result, retry, history.
7. Timer edge cases: auto-submit at 0, time-out while away.

**Phase 3: Signup handoff and hooks (≈ ½ day)**
8. `signupUrl.ts`, `inAppBrowser.ts`, `OpenInBrowserSheet`, `SignupCta`.
9. `track.ts` hook points.

**Phase 4: Test and deploy (≈ ½ day)**
10. GitHub repo + Netlify site + `try.railjee.in` DNS.
11. Device testing (below), performance check, fix issues.
12. Point the ad at `try.railjee.in/?d=ccts&utm_…`.

About 2 working days in total. That's tight for a relaunch "in about 2 days".
If time runs short, ship phases 1, 2 and 3 without the optional score passthrough.

---

## 13. Testing checklist

**Exam behaviour**
- [ ] Select, change and skip answers; flag; palette jump; Previous/Next; last-question Submit
- [ ] Submit popup counts correct; Review returns to the exam
- [ ] Timer red near the end; auto-submit at 0
- [ ] Result maths matches the main site for the same answers (negative marking)
- [ ] Review filters and counts correct

**Storage**
- [ ] Reload mid-exam → resume with answers + time
- [ ] Close the tab for longer than the time left → auto-submitted on return
- [ ] Reload after submit → result screen; Retry → fresh attempt, history kept
- [ ] Bump `version` → old data ignored
- [ ] Private mode / storage blocked → demo still works

**In-app browser (real devices, must pass before relaunch)**
- [ ] Android + Facebook app: open the link (via a post, Messenger, or ad preview) → signup tap opens Chrome at railjee.in signup with UTM/fbclid intact
- [ ] Android + Instagram app: same
- [ ] Android without Chrome as default browser: still opens Chrome
- [ ] Jump blocked → fallback sheet appears; copy link and email signup work
- [ ] iOS + Facebook: fallback sheet shown; email signup works
- [ ] Google signup completes in Chrome after the jump and lands on `redirect`

**Performance**
- [ ] Bundle size within budget (`vite build` report)
- [ ] Lighthouse mobile, DevTools Slow 4G

---

## 14. Open questions

1. **Which CCTS paper** (paper ID) should be the first demo? Its 15 chosen
   questions and answers will be public in the page code.
2. **Timer:** 12 minutes (proposed) or 10?
3. **After signup, where should CCTS visitors land?** `/departments/commercial`
   or the home page?
4. Show the **score before signup** (current plan: yes, then push signup), or
   show only partial results and require signup for the full review?

Decided: separate repo; `try.railjee.in`; 15 questions; Preact + Vite + Tailwind.
