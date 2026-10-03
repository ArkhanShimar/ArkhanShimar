# GitHub profile package — Arkhan Shimar

## Install

Copy the contents of this folder into the root of your public `ArkhanShimar/ArkhanShimar` repository:

- `README.md`
- `assets/`
- `scripts/`
- `.github/workflows/profile-stats.yml` (include this hidden folder)

The banner, ASCII-style portrait, badges, and dashboard are already generated. They display immediately after you commit the files. Your portfolio website is unchanged.

For automatic updates, open your profile repository’s Actions tab, select **Refresh profile dashboard**, and run it once. The workflow then runs daily. It uses the built-in GitHub token to commit updated cards; no personal access token or third-party stats service is required. Repository or organization policies must permit GitHub Actions to write repository contents. Protected branches may prevent the workflow commit; in that case run the generator locally and commit the assets yourself.

## What is included

- `assets/banner.png`: black-and-emerald banner from the previous package.
- `assets/profile-original.png`: exact duplicate of `public/profile.png`; original website photo untouched.
- `assets/ascii-portrait.svg`: real ASCII characters sampled from the original photo, displayed in emerald green.
- `assets/portrait.txt`: matching plain-text character grid.
- `assets/ascii-portrait.png`: retained legacy illustration; no longer used by the README.
- `assets/overview.svg`: public repositories, stars on owned non-fork repos, followers, and joining year.
- `assets/contributions.svg`: public GitHub contribution calendar.
- `assets/languages.svg`: language percentages by byte count across public non-fork repositories.
- `assets/activity.svg`: latest 12 seven-day contribution buckets, not commit counts.
- `assets/streak.svg`: contribution totals, current streak, longest streak, and active days within the displayed calendar. Today with zero contributions does not break the current streak until the day ends (UTC).
- `assets/stack-*.svg`, `assets/badge-*.svg`, and `assets/link-*.svg`: local green skill cards, project labels, and contact badges.
- `assets/github-data.json`: source snapshot for the generated dashboard.
- `dashboard-preview.png`: combined preview of the stats panels.

Numbers are real public account data, not the example profiles’ figures. Your first snapshot was generated on 2026-10-01. Card timestamps make their freshness explicit. Private source code and credentials are not fetched or included. GitHub’s public calendar may include anonymized private contributions if your GitHub visibility settings show them.

## Refresh locally

With Node.js 22 or later:

```sh
node scripts/update-stats.mjs
```

The script uses GitHub’s public REST API and public contribution calendar markup. It fetches all data before writing cards and stops if the calendar cannot be parsed, preserving the last generated set on fetch/parse failure. If GitHub changes its calendar markup, the parser may need updating. Unauthenticated REST requests are subject to GitHub rate limits; the included workflow authenticates using its temporary built-in token.

To regenerate the static badges: `node scripts/create-badges.mjs`.

## Design and sources

Palette: black `#080b09`, emerald `#22c55e`, mint `#86efac`, dark panel `#0b100d`.

GitHub-compatible images and tables combine the supplied examples: terminal introduction with portrait, technology badges, overview metrics, contribution calendar, language ring, recent activity, streak statistics, project cards, and expandable credentials. GitHub controls the README page background; the supplied image cards keep their own black-and-green palette in either GitHub theme.

Data sources: https://api.github.com/users/ArkhanShimar and https://github.com/users/ArkhanShimar/contributions. Project, education, and experience details come from the existing local portfolio. The current portrait is generated directly from photo pixels using `scripts/generate-ascii.mjs`. It contains real text glyphs and no embedded raster image.

Reference on public hosted stats reliability: https://github.com/anuraghazra/github-readme-stats. This package instead checks its generated cards into your own profile repository.

Nothing has been published to GitHub by this task.

## Regenerate the real ASCII portrait

Install the optional converter dependency with `npm install --no-save sharp`, then run `node scripts/generate-ascii.mjs`. The supplied SVG/TXT files work without installing anything. The original image is unchanged. The generator also produces an optional standalone terminal card.
