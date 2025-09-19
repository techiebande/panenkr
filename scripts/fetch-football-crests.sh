#!/usr/bin/env bash
# Download football club crests (SVG/PNG) from football-data.org
# Usage:
#   FD_API_TOKEN=xxxxx scripts/fetch-football-crests.sh [COMP ...]
# If no competitions are supplied, a default set is used: PL PD SA BL1 FL1 DED PPL
# Output goes to public/crests

set -euo pipefail

# Ensure in repo root (script can be run from any path)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
ROOT_DIR="$(cd -- "${SCRIPT_DIR}/.." &>/dev/null && pwd)"
OUT_DIR="${ROOT_DIR}/public/crests"

mkdir -p "${OUT_DIR}"

if [[ -z "${FD_API_TOKEN:-}" ]]; then
  echo "Error: FD_API_TOKEN is not set.\n" \
       "Please export your football-data.org token first, e.g.:\n" \
       "  export FD_API_TOKEN=\"{{FOOTBALL_DATA_API_TOKEN}}\"" 1>&2
  exit 1
fi

# Check prerequisites
if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Install with: brew install jq" 1>&2
  exit 1
fi
if ! command -v iconv >/dev/null 2>&1; then
  echo "iconv is required (should be available on macOS)." 1>&2
  exit 1
fi

# Default competitions if none provided
if [[ $# -eq 0 ]]; then
  competitions=(PL PD SA BL1 FL1 DED PPL)
else
  competitions=("$@")
fi

slugify() {
  # Lowercase, strip accents, replace non-alnum with dashes
  local input="$1"
  # On macOS, iconv may warn/exit non-zero for untransliterable chars; use -c and fallback
  local cleaned
  cleaned=$(printf '%s' "$input" | iconv -f UTF-8 -t ASCII//TRANSLIT -c 2>/dev/null || printf '%s' "$input")
  printf '%s' "$cleaned" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'
}

save_file() {
  local url="$1" name="$2"
  local slug ext tmp
  slug="$(slugify "$name")"
  ext="${url##*.}"
  # Normalize extension
  if [[ "$ext" != "svg" && "$ext" != "png" && "$ext" != "jpg" && "$ext" != "jpeg" ]]; then
    ext="svg"
  fi
  tmp="${OUT_DIR}/${slug}.${ext}.part"
  if curl -fsSL "$url" -o "$tmp"; then
    mv "$tmp" "${OUT_DIR}/${slug}.${ext}"
    echo "Saved ${slug}.${ext}"
  else
    rm -f "$tmp" || true
    echo "Warn: failed to download for ${name}" 1>&2
  fi
}

TOTAL=0
for comp in "${competitions[@]}"; do
  echo "Fetching teams for competition: ${comp}"
  json=$(curl -fsS -H "X-Auth-Token: $FD_API_TOKEN" \
    "https://api.football-data.org/v4/competitions/${comp}/teams") || {
      echo "Error: API call failed for ${comp}" 1>&2
      continue
    }

  # Some responses might paginate or shape differently; we expect .teams[]
  lines=$(printf '%s' "$json" | jq -r '.teams[]? | [.name, .crest] | @tsv')

  if [[ -z "$lines" ]]; then
    echo "No teams found for ${comp} (check plan access or competition code)." 1>&2
    continue
  fi

  count=0
  while IFS=$'\t' read -r name url; do
    [[ -z "$url" ]] && continue
    save_file "$url" "$name"
    count=$((count+1))
  done <<< "$lines"
  TOTAL=$((TOTAL+count))
done

echo "Done. Attempted to save ${TOTAL} crest files into ${OUT_DIR}."
