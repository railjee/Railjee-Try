# RailJee Demo (`try.railjee.in`)

A fast, static "try a test" site for ads. Visitors take a short sample paper with the
same exam screens as [railjee.in](https://railjee.in), see their score and the answer
review, and are invited to sign up on railjee.in. No login, no backend.

CCTS is the first demo. More demos can be added as JSON files.

## Features
- **Start card:** paper name, question count, time, negative marking; one tap to start
  (the timer starts on the tap, not on page load). Resume button if an attempt is saved.
- **Exam screen (same UI as railjee.in):**
  - Header: logo, paper name, `Q 3/10`, countdown timer (turns red under 2 min),
    question-grid button with answered count, progress bar
  - Question card: English + Hindi, options A–D, Flag for Review
  - Previous / Next (Next becomes Submit on the last question)
  - Question palette (bottom sheet on mobile, side panel on desktop) to jump to any question
  - Submit confirmation popup with answered / skipped / flagged counts
  - Auto-submit when time runs out
- **Result screen:** score with negative marking, percentage, pass/fail, correct / wrong /
  skipped, time taken, accuracy; signup card; Review Answers; Retry
- **Review screen:** filters (All / Correct / Wrong / Skipped), your answer vs correct
  answer, palette, previous/next
- **Saved progress (localStorage):** reload or come back → resume with time left; after
  submitting → the result is shown again; retry keeps attempt count and best score
- **Signup handoff:** sticky signup bar and buttons; inside the Facebook/Instagram app
  on Android it opens Chrome directly (Google sign-in doesn't work inside those apps);
  fallback sheet with "open in browser" help, copy link and email signup
- **Attribution:** `utm_*` and `fbclid` from the ad URL are passed to the railjee.in signup URL
- **Light:** about 27 KB gzipped (JS + CSS + demo data) (logo inlined in the JS); system fonts only

## Run locally
Requires Node 18+.
```bash
npm install
npm run dev        # http://localhost:5173/?d=ccts
npm run build      # type-check + production build into dist/
npm run preview    # serve the built site
```

### Test on your phone (same Wi-Fi)
```bash
npm run dev:phone       # dev server on your local network
npm run preview:phone   # or: the production build (run `npm run build` first), port 4173
```
Vite prints a `Network:` URL such as `http://192.168.x.x:5173/`. Open it on the phone
(add `?d=ccts`). Phone and PC must be on the same Wi-Fi. If it doesn't load, allow
Node.js through Windows Firewall for that network type (Public/Private).

## Add or change a demo
1. Create `src/demos/<id>.json` (copy `ccts.json` as a template). Fields:
   - `id`, `version` (bump whenever questions change: old saved attempts are then ignored)
   - `paper`: `name`, `durationMinutes`, `negativeMarking`, `passPercentage`
   - `copy`: `headline`, `subline`, `ctaTitle`, `ctaButton` (English, like the main site's UI)
   - `signup`: `path` on railjee.in, `redirect` after signup, default `utm` tags
   - `questions`: same shape as the main site:
     `{ id, question: {en, hi}, options: [{en, hi} ×4], details: [], correctAnswer }`
2. Keep it to ~10 easy, well-known questions (max 30); allow about 48 s per question for `durationMinutes`.
3. Link the ad to `https://try.railjee.in/?d=<id>&utm_campaign=<name>`.
   Without `?d=`, the default demo (`DEFAULT_DEMO_ID` in `src/config.ts`) opens.

Questions are exported once from MongoDB (`railji_prod_db.question-bank`, by `paperId`).
The site never talks to the database.

## Deploy

### GitHub Pages (current)
```bash
npm run publish:pages                          # build + commit dist/ to gh-pages + push
CNAME=try.railjee.in npm run publish:pages     # once DNS for try.railjee.in is set up
NO_PUSH=1 npm run publish:pages                # commit the build locally only
```
- `scripts/publish-gh-pages.sh` builds the site and commits `dist/` to the `gh-pages`
  branch (an orphan branch with only the static files) without checking it out.
- GitHub repo → Settings → Pages → Source: "Deploy from a branch", branch `gh-pages`, folder `/`.
- Asset paths are relative (`base: "./"` in `vite.config.ts`), so the site works at
  `<user>.github.io/<repo>/` and on a custom domain.
- Custom domain: add a CNAME record `try` → `<user>.github.io` at the DNS provider, then
  publish with `CNAME=try.railjee.in` (every publish replaces the branch contents, so keep
  passing it) and set the domain in Settings → Pages.

### Netlify (alternative)
New site from this repo: build `npm run build`, publish `dist`. `public/_headers` sets
long caching for hashed assets and no-cache for `index.html` (Netlify only; GitHub Pages
ignores it).

## Before relaunching the ad
- [ ] Test on a real Android phone **inside the Facebook app** (open the link from a post,
      Messenger, or the ad preview): signup tap → Chrome opens railjee.in signup with UTM/fbclid
- [ ] Same inside Instagram; check the fallback sheet on iPhone
- [ ] Lighthouse mobile / Chrome DevTools "Slow 4G"
- [ ] Wire Meta Pixel in `src/lib/track.ts` (separate work)

## Project docs
- `CLAUDE.md`: rules and structure for anyone (or Claude) changing this repo
- `PLAN.md`: original design and decisions
- `IMPLEMENTATION.md`: what was built, phase by phase, and what's left
