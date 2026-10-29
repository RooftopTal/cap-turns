# valueOfAdventure experiment

What is a garbo turn actually worth, and do other `valueOfAdventure` (VoA)
settings make more money? This records the October 2026 baseline and the plan
for testing other values a week at a time.

## Setting the values

`cap` sets `valueOfAdventure` itself at the start of each half, so
`set valueOfAdventure` gets overwritten. Use these instead:

    set cap_valueMorning = 7000
    set cap_valueEvening = 6500

Unset or 0 means the defaults, 6500 / 6000. The nightcap value follows the
morning value; the overdrunk value follows the evening value; a resumed
multi-day ascension's evening uses the average of the two. The realm
decisions compare against the same values.

## Measuring

    python -I tools/voa_report.py <sessions dir> --from 20261024 --to 20261029

For each main garbo run (morning: over 450 turns, evening: 250-450) it prints
three per-turn figures, then the day's garbo total:

- **garbo**: garbo's own "Marginal MPA [total]". Raw meat is taken while 75
  to 25 turns of the run remain; items over a wider window, valued at garbo's
  prices, with outliers removed.
- **lower**: our own count. Meat + items dropped in the last 50 turn-taking
  Barf Mountain fights. Items at max(mall price, autosell) from mafia's
  `data/mallprices.txt`. Doesn't subtract buff upkeep, and mall price is the
  lowest listing, so it overstates slightly.
- **upper**: the same window, adding the free fights that happened inside it
  (Kramco, voters, wanderers, and so on), over the same turns. Some of those
  are daily allowances, not turn-driven, so this overcounts.

Separately, check the **wealth** tab's daily meat on the sheet. It's the only
figure that includes everything, realms and mall sales included. Big sales
make it spiky, so compare medians, not means.

## Baseline: October 2026 (VoA 6500 / 6000)

Per-turn medians:

| Half | Period | garbo | lower | upper |
|---|---|---|---|---|
| Morning | Oct 1-23 (20 days) | 6,387 | 5,904 | 6,399 |
| Morning | Oct 24-29 (6 days) | 6,550 | 6,172 | 6,576 |
| Evening | Oct 1-23 (20 days) | 2,007* | 6,293 | 7,106 |
| Evening | Oct 24-29 (6 days) | 5,946 | 6,126 | 7,157 |

\* Garbo's evening items figure was strongly negative on most days before
Oct 24 (as low as -6,200 a turn), so its evening totals then are unreliable.
Its raw meat is steady throughout, about 5.3k (morning) and 5.5k (evening).

Per-day:

| Period | Garbo turns | Garbo "generated" | Wealth daily (median) |
|---|---|---|---|
| Oct 7-21 | ~1,016 | ~11.1M | ~7.6M |
| Oct 23-29 | ~994 | ~8.5M | ~8.6M (excluding the 24.2M and 16.1M days) |

Garbo's "generated" fell by about 2.5M a day from Oct 24, all of it in items
(raw meat unchanged), while the wealth tab went *up*, and on the same day its
negative evening item figures stopped. The cause isn't known, but it looks
like a change in how garbo counts items, not real income. **Treat garbo's
totals as comparable only within a stretch where nothing like that has
changed, and lean on the wealth tab for the day's real outcome.**

Where our "lower" item value comes from: bags of park garbage ~18%, fat stacks
of cash ~12%, astral mushrooms ~11%, flapper flies ~8%.

Realm yields at baseline (see `src/realms/realms.ts`):

- FantasyRealm: ~7.2k a turn (327 Rubees, LyleCo at ~2.9M). Ran in both
  halves on Oct 29.
- PirateRealm finishing leg: ~5.7k a turn (windicles at 6k). Skipped except
  for the evening cash-in at 600+ fun.

## Plan

| Week | Morning | Evening |
|---|---|---|
| Baseline | 6,500 | 6,000 |
| 1 | 7,000 | 6,500 |
| 2 | 7,500 | 7,000 |
| 3 | 6,000 | 5,500 |

Things that will move with VoA besides garbo itself:

- **Realm decisions.** At current prices, 7,500 morning skips FantasyRealm
  (7.2k) in the morning, and 5,500 evening makes PirateRealm's finish (5.7k)
  run in the evening. That's part of what's being tested, but note it when
  reading results. `set cap_realms = false` takes realms out entirely.
- **Garbo's diet and buffs.** A higher VoA makes garbo pay more for
  adventures and turn-extending buffs, so expect more turns and more spend.
  That's why the outcome to compare is the day's total, not the per-turn
  figures.

Things to keep out of the comparison:

- Halloween (Oct 31, `cap farm=ween`) and other seasonal or event days.
- Days with a big purchase or sale on the wealth tab (use the "Big gain/spend"
  column).
- Garbo updates mid-week. Note the date if one lands.
- Price swings in what the realms and garbo drop (LyleCo, windicles, park
  garbage).

## Results

(One row per week once it's done.)

| Week | Morning / Evening | garbo (m / e) | lower (m / e) | upper (m / e) | Wealth daily median | Notes |
|---|---|---|---|---|---|---|
| Baseline (Oct 24-29) | 6,500 / 6,000 | 6,550 / 5,946 | 6,172 / 6,126 | 6,576 / 7,157 | ~8.6M | |
