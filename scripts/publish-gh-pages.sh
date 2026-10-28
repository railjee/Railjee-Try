#!/usr/bin/env bash
# Builds the site and commits dist/ to the `gh-pages` branch (an orphan branch that
# holds only the static files), then pushes it. GitHub Pages serves that branch.
#
# Usage:   npm run publish:pages
# Options: CNAME=try.railjee.in npm run publish:pages   # add a custom-domain CNAME file
#          NO_PUSH=1 npm run publish:pages              # commit locally, don't push
#
# It never checks out gh-pages: the build is committed with a temporary index,
# so your working tree and current branch are untouched.
set -euo pipefail

BRANCH=gh-pages
cd "$(dirname "$0")/.."

npm run build

touch dist/.nojekyll                       # serve files as-is (no Jekyll processing)
if [ -n "${CNAME:-}" ]; then echo "$CNAME" > dist/CNAME; fi

SOURCE_SHA=$(git rev-parse --short HEAD)
# Git needs the temporary index to not exist yet (an empty file is rejected)
TMP_INDEX="$(git rev-parse --absolute-git-dir)/gh-pages-index"
rm -f "$TMP_INDEX"
trap 'rm -f "$TMP_INDEX"' EXIT

export GIT_INDEX_FILE="$TMP_INDEX"
git --work-tree=dist add -A -f .
TREE=$(git write-tree)
unset GIT_INDEX_FILE

# First publish creates an orphan commit; later ones stack on the previous build.
if git rev-parse --verify -q "refs/heads/$BRANCH" >/dev/null; then
  PARENT=(-p "$(git rev-parse "refs/heads/$BRANCH")")
else
  PARENT=()
fi

COMMIT=$(git commit-tree "$TREE" "${PARENT[@]}" -m "Deploy build from main@$SOURCE_SHA")
git update-ref "refs/heads/$BRANCH" "$COMMIT"
echo "Committed build to $BRANCH ($COMMIT)"

if [ -z "${NO_PUSH:-}" ]; then
  git push origin "$BRANCH"
fi
