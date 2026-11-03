#!/usr/bin/env bash
# Generate the changelog of one deployable with git-cliff (ADR-SHARED-0014).
#
# Usage:
#   scripts/changelog.sh <deployable>            regenerate <dir>/CHANGELOG.md (Unreleased section)
#   scripts/changelog.sh <deployable> next       print the next tag, e.g. bff/v0.2.0
#   scripts/changelog.sh <deployable> release    write CHANGELOG.md for the next version and print its tag
#   scripts/changelog.sh <deployable> notes      print the notes of the latest release (GitLab Release body)
#
# Deployables: auth-server, bff, platform, web
#
# The script never commits, tags or pushes. A release is:
#   tag=$(scripts/changelog.sh bff release)
#   git commit -am "chore(release): $tag" && git tag -a "$tag" -m "$tag"
#
# Requires git-cliff 2.14.x on PATH, or CLIFF_BIN=/path/to/git-cliff.
set -euo pipefail

usage() {
  sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//' >&2
  exit 2
}

[[ $# -ge 1 && $# -le 2 ]] || usage
unit=$1
mode=${2:-unreleased}

# Paths whose commits belong to each deployable. The first entry is where the
# CHANGELOG.md lives. backend/libs/commons and the version catalog have no
# changelog of their own: they ship inside the backend deployables, so their
# changes are listed there.
case "$unit" in
  auth-server | bff | platform)
    paths=("backend/$unit" backend/libs/commons backend/gradle) ;;
  web)
    paths=(web) ;;
  *)
    echo "unknown deployable: $unit" >&2
    usage ;;
esac

root=$(git rev-parse --show-toplevel)
dir="$root/${paths[0]}"
cliff=${CLIFF_BIN:-git-cliff}

if ! command -v "$cliff" >/dev/null 2>&1; then
  echo "git-cliff not found; install 2.14.x or set CLIFF_BIN" >&2
  exit 1
fi
if [[ ! -d "$dir" ]]; then
  echo "deployable directory does not exist yet: ${paths[0]}" >&2
  exit 1
fi

# Tags are scoped per deployable (bff/v1.2.0), so a bff release never ends at
# an auth-server tag.
args=(--config "$root/cliff.toml" --repository "$root" --tag-pattern "^${unit}/v[0-9]")
for p in "${paths[@]}"; do
  args+=(--include-path "$p/**")
done

# Before the first tag, git-cliff falls back to the shared initial_tag (0.1.0)
# and then rejects it because it does not match "^<unit>/v". So the first
# release is decided here; later bumps come from git-cliff. The result is
# rebuilt as "<unit>/v<semver>" either way so the prefix is always right.
next_tag() {
  local v
  if [[ -z $(git -C "$root" tag --list "${unit}/v[0-9]*") ]]; then
    v=0.1.0
  else
    v=$("$cliff" "${args[@]}" --bumped-version)
  fi
  v=${v##*/}
  echo "${unit}/v${v#v}"
}

case "$mode" in
  unreleased)
    "$cliff" "${args[@]}" --output "$dir/CHANGELOG.md" ;;
  next)
    next_tag ;;
  release)
    tag=$(next_tag)
    "$cliff" "${args[@]}" --tag "$tag" --output "$dir/CHANGELOG.md"
    echo "$tag" ;;
  notes)
    "$cliff" "${args[@]}" --latest --strip header ;;
  *)
    usage ;;
esac
