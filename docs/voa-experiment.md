# valueOfAdventure experiment

What should `valueOfAdventure` (VoA) be? It's the least we're willing to pay
for one more adventure, so it should match what the *last* adventures of a
leg are actually worth: an adventure that would earn less than VoA isn't worth
buying. This records the October 2026 baseline and the plan for testing other
values a week at a time.

## Setting the values

`cap` sets `valueOfAdventure` itself at the start of each half, so
`set valueOfAdventure` gets overwritten. Use these instead:

    set cap_valueMorning = 6500
    set cap_valueEvening = 6500
    set cap_valueOverdrunk = 6000

Unset or 0 means the defaults, which are the values above (6500 / 6000
during the experiment, when the overdrunk run used the evening value). The
nightcap value follows the morning value; a resumed multi-day ascension's
evening uses the average of morning and evening. The realm decisions
compare against the same values.

## Measuring

    python -I tools/voa_report.py <sessions dir> --from 20261024 --to 20261029

Each log day has three legs, split on markers `cap` always prints:

- **morning**: sober garbo turns, up to the nightcap.
- **overdrunk**: the ~90 garbo turns after the nightcap, before ascending.
- **evening**: garbo turns after the ascension. A restart after an abort is
  joined to the leg it belongs to.

For each leg it prints:

- **lower**: meat + items from the last 50 turn-taking Barf Mountain
  adventures, per adventure. **This is the figure to judge VoA on.** Items
  are valued at the higher of the lowest current mall listing (mafia's
  `data/mallprices.txt`, so a bag of park garbage is ~200) and autosell.
  Any single drop worth 100k or more is left out and counted, since a rare
  drop says nothing about the next adventure. Turns with the Skeleton of
  Crimbo Past out are skipped: its knucklebones stop at 100 a day, and since
  Nov 5 garbo often runs it right up to the end of the morning, but one more
  adventure would go to a different familiar. `--last 100` widens the window.
- **upper**: the same window plus every free fight and free adventure that
  happened inside it, over the same turns. Some of those are daily
  allowances that don't scale with turns, so this overstates.
- **garbo**: garbo's own "Marginal MPA" for the leg's longest run. Its item
  prices spike (100 knucklebones counted at 13.4M on Nov 6), so use it only
  as a cross-check.

Not used: day totals, from garbo or the wealth tab. A melange sale or a
price spike moves them by millions, which drowns out the per-adventure
difference being tested. Target fights (cockroaches) happen early in the day
and never fall in the window.

Caveats on **lower**: it uses today's mall prices for every day, not each
day's own; it doesn't subtract buff upkeep; and the lowest listing is a bit
above what selling actually realises.

## Baseline: October 24-29 (VoA 6500 / 6000)

Medians of **lower** / **upper** over 6 days:

| Leg | lower | upper |
|---|---|---|
| Morning | 6,404 | 6,722 |
| Overdrunk | 5,835 | 6,516 |
| Evening | 6,312 | 6,752 |

Where the item value comes from: bags of park garbage ~18%, fat stacks of
cash ~12%, astral mushrooms ~11%, flapper flies ~8%.

The overdrunk leg is worth ~500 less than the sober morning, and that run's
VoA is the evening value, so it's worth checking separately once the weekly
tests are done.

Realm yields at baseline (see `src/realms/realms.ts`):

- FantasyRealm: ~7.2k a turn modelled (327 Rubees, LyleCo at ~2.9M); Nov 3's
  dives measured ~7.6k.
- PirateRealm finishing leg: ~5.7k a turn (windicles at 6k). Skipped except
  for the evening cash-in at 600+ fun.

## Plan

| Week | Morning | Evening | Dates |
|---|---|---|---|
| Baseline | 6,500 | 6,000 | Oct 24-29 |
| 1 | 7,000 | 6,500 | Oct 30-Nov 7 |
| 2 | 7,500 | 7,000 | from Nov 8 |
| 3 | 6,000 | 5,500 | |

Things that will move with VoA besides garbo itself:

- **Realm decisions.** At current prices, 7,500 morning skips FantasyRealm
  (7.2k) in the morning, and 5,500 evening makes PirateRealm's finish (5.7k)
  run in the evening. `set cap_realms = false` takes realms out entirely.
- **Garbo's diet and buffs.** A higher VoA makes garbo pay more for
  adventures and turn-extending buffs, so expect more turns. The question is
  whether the last of those turns still earn more than they cost, which is
  what **lower** answers.

Things to keep out of the comparison:

- Halloween (Oct 31, `cap farm=ween`) and other seasonal or event days.
- Garbo updates mid-week. Note the date if one lands.
- Price swings in what Barf Mountain drops (park garbage, flapper flies).

## Results

**lower** / **upper** medians per leg, with prices as of Nov 23 for every row.

| Week | Morning / Evening VoA | Days | Morning | Overdrunk | Evening | Wealth daily median | Notes |
|---|---|---|---|---|---|---|---|
| Baseline | 6,500 / 6,000 | Oct 24-29 (6) | 6,386 / 6,690 | 5,846 / 6,546 | 6,306 / 6,756 | 8.8M | Morning runs ~547 turns. |
| 1 | 7,000 / 6,500 | Oct 30, Nov 1-7 (8) | 6,300 / 6,666 | 5,720 / 5,789 | 6,916 / 7,167 | 8.5M | Garbo updated Nov 1. Morning ~524 turns. |
| 2 | 7,500 / 7,000 | Nov 8-11, 19-21 (7) | 6,195 / 6,335 | 5,948 / 5,948 | 6,637 / 6,702 | 8.2M | Morning FantasyRealm skipped; morning ~606 turns. No logs Nov 12-18. |
| 3 (ended early) | 6,000 / 5,500 | Nov 22-25 (4) | 6,374 / 6,705 | 6,027 / 6,653 | 6,489 / 7,139 | 9.1M (2 days) | Morning ~479 turns. Nov 25 morning was low (5.4k, raw meat down ~20%). PirateRealm runs (~6.8k modelled). FantasyRealm fell to ~6.3k on Nov 24 (Rubees at 833 via LyleCo). |

The wealth column's row for a given day records the previous day's runs, so
each week's wealth median is taken one row later.

## Conclusion (Nov 25)

Over the last 100 Barf Mountain adventures, the morning median stayed at
6.5-6.65k in every week, whether VoA was 6,000 or 7,500, and the evening at
6.7-7.2k. The day-to-day spread (+/-600) is bigger than any difference
between weeks, so more weeks wouldn't settle it further. What does move is
run length: a higher VoA buys more turns. Buying a turn earns a profit as
long as VoA is below the ~6.5k morning / ~6.9k evening those turns earn,
so:

- Morning 6,500: about break-even on the last turns.
- Evening 6,500: safely below what evening turns earn; 7,000 was about
  break-even in week 2.
- Overdrunk is ~6.0k; it follows the evening value unless a separate
  setting is added.

The difference between any of these choices is tens of thousands of meat a
day, under 1% of daily income.
