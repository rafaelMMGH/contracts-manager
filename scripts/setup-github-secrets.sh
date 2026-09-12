#!/usr/bin/env bash
# Sets GitHub Actions secrets required for Vercel deploy workflows.
# Prerequisites: `gh auth login`, and a Vercel token from https://vercel.com/account/tokens
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_JSON="$ROOT/.vercel/project.json"

if [[ ! -f "$PROJECT_JSON" ]]; then
  echo "Missing $PROJECT_JSON — run: vercel link" >&2
  exit 1
fi

if ! command -v gh >/dev/null; then
  echo "GitHub CLI (gh) is required." >&2
  exit 1
fi

ORG_ID="$(python3 -c "import json; print(json.load(open('$PROJECT_JSON'))['orgId'])")"
PROJECT_ID="$(python3 -c "import json; print(json.load(open('$PROJECT_JSON'))['projectId'])")"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "Create a token at https://vercel.com/account/tokens then paste it:"
  read -r -s VERCEL_TOKEN
  echo
fi

gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "$ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$PROJECT_ID"

echo "GitHub secrets set: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID"
