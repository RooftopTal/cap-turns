# cap-turns

Captain Yaksworth's daily turns, in TypeScript. Successor to the ASH scripts in
`<mafia>/scripts/cap`, which still run the actual day until the port is done.

## Layout

    src/            what you edit
    src/lib/        ported helpers
    KoLmafia/       build output, committed -- this is what mafia installs

## Developing

Build straight into the mafia scripts folder and leave it watching:

    CAP_OUT="C:/Users/TimLedsam/Dropbox/kolmafia-data/scripts/cap-turns" npm run watch

Then in the gCLI, `cap --help`. The old ASH is still invocable as `daily-cap`,
so you can run both side by side.

Windows cmd:

    set CAP_OUT=C:\Users\TimLedsam\Dropbox\kolmafia-data\scripts\cap-turns
    npm run watch

## Other commands

    npm run check     tsc, no emit
    npm run build     build into KoLmafia/ for committing

## Installing via mafia

Commit `KoLmafia/scripts/cap/cap.js`, push, then in the gCLI:

    git checkout https://github.com/RooftopTal/cap-turns
    git update

`manifest.json` points mafia at the `KoLmafia/` subtree. Don't run this against
the same folder `CAP_OUT` writes to -- mafia will see local changes and try to
merge them.

## Migration status

Ported:

- `general/day_ahead.ash` -> `src/lib/day.ts`
- `realms/go_to_piraterealm.ash`, `realms/go_to_fantasyrealm.ash` -> `src/lib/realms.ts`
- tuning constants from `daily-cap.ash` -> `src/lib/constants.ts`
- `check_for_input()` argument parsing -> grimoire `Args` in `src/main.ts`
- `main()` from `daily-cap.ash`, transcribed into `src/main.ts`
- `safe_garbo` -> `src/lib/cap_garbo.ts` (named to avoid confusion with the
  actual `garbo` script/library referenced constantly via `cliExecute`; now
  calls `goToPirateRealm`/`goToFantasyRealm` from `src/lib/realms.ts`
  directly instead of the ASH versions)
- `aftercore_actions`, `trick_or_treat` -> `src/lib/aftercore.ts`
- `generic_loop_stuff` -> `src/lib/loop.ts`
- `do_pvp` -> `src/lib/pvp.ts`
- `end_of_day` -> `src/lib/endOfDay.ts` (folding in its local
  `buy_meat_golem`/`join_raffle` helpers)
- `pick_lock` -> `src/lib/pickLock.ts`, `set_sit_course` ->
  `src/lib/setSitCourse.ts` (both now use libram's `withChoice` instead of
  manual save/set/restore of the choice preference -- see the pick_lock bug
  below, which withChoice makes structurally impossible to repeat)
- `use_censer` -> `src/lib/useCenser.ts`
- `take_meteorite_ade` -> `src/lib/takeMeteoriteAde.ts`
- `clear_pledge` -> `src/lib/clearPledge.ts`
- `drink_nightcap` -> `src/lib/drinkNightcap.ts`, `stooper_drink` ->
  `src/lib/stooperDrink.ts`
- `open_beach` -> `src/lib/openBeach.ts`
- `check_tickets` -> `src/lib/tickets.ts`

`cap` runs the whole day natively in TypeScript now. **The migration is
functionally complete.** What's left ASH-side and reached via `cliExecute`,
staying that way permanently:

- `store_mall_data.ash` -- deliberately never ported. Its `file_to_map`/
  `map_to_file` round-trip reads and rewrites a real accumulated data file
  (`store log <name>.txt`, 70k+ lines and growing) with key-preserving
  tab-separated semantics that KoLmafia's JS-exposed `fileToArray` does
  *not* replicate (`fileToArray` assigns fresh sequential keys and never
  splits on tab -- see the note below). There's a `fileToMap`/`mapToFile`
  pair that calls the same underlying Java as the ASH functions and would
  likely work, but the payoff (porting a pure logging/tracking function)
  didn't justify the residual risk to real historical data. Decided
  2026-09-07 to leave this ASH forever, same treatment as `realms/`.
- `realms/` (`FantasyRealm.ash`, `PirateRealm_cap.ash`) -- 2,600+ lines of
  forked community combat automation, never in scope to own. Called via
  `cliExecute` indefinitely.
- Trivial delegation with nothing to gain from porting: `check_prism`,
  `break_hippy_stone`, `psychic`, `clan_peridot`, `crimbone` (its real logic
  is commented out in the source -- nothing there yet to port).
- The mall/ascension scripts (`check_mall_prices`, `sccs_preparation`,
  `trigger_*_ascension`, `run_sccs_ascension`, `pvp-safety`) -- always
  separate files, no reason to move them.

To make that possible, the dozen functions that used to live only inside
`daily-cap.ash` (`aftercore_actions`, `trick_or_treat`, `crimbone`, `safe_garbo`,
`generic_loop_stuff`, `do_pvp`, `check_prism`, `set_sit_course`, `clear_pledge`,
`use_censer`, `pick_lock`, `take_meteorite_ade`, `break_hippy_stone`) were each
split into their own `general/*.ash` file with a `void main()` wrapper, since
`cliExecute` can only reach a script by filename, not a function inside one.
`daily-cap.ash` still imports and calls them directly as before, so `daily-cap`
keeps running unchanged -- `cap` and `daily-cap` are two independent front ends
onto the same ASH bodies for now. Shared tuning constants moved to
`general/cap_constants.ash` (named to avoid a filename collision with the
pre-existing `CONSUME/CONSTANTS.ash`).

Two related ASH bugs turned up and got fixed while wiring this up, both because
their old `main()` silently hardcoded a value that only mattered once something
started calling that `main()` instead of the underlying function directly:

- `general/end_of_day.ash` main() hardcoded the tolerance to `5` instead of
  taking it as a parameter; `daily-cap.ash` had always bypassed it by calling
  `end_of_day()` directly with the real `night_tolerance` (25).
- `paths/standard/trigger_standard_ascension.ash` main() hardcoded
  `is_hardcore` to `false`; same story, `daily-cap.ash` always passed the real
  flag directly. `cap --hardcore` needs the real one to work.

One intentional behavior change: the old `main()` called `day_ahead()` twice in
a row right before the ascension-trigger check (once to `print()` it, once to
branch on it) -- clearly a debug leftover, since `day_ahead()` has no side
effects besides printing. Dropped the redundant call in `src/main.ts`.

Two more non-obvious things that turned up porting `safe_garbo`:
`_lastPirateRealmIsland` comes back from libram's `get()` as a real
`Location` object, not a string (it's typed that way in libram's property
tables) -- comparing it to the ASH original's `"Trash Island"` string would
silently always be false, so it's compared with `` $location`Trash Island` ``
instead. `_frHoursLeft` is the opposite surprise: typed as a string, so it
needs `Number(get(...))` before the `!== 0` check the ASH did directly.

A real bug turned up testing phase 3, unrelated to the port itself:
`realms/keepStatsLow.ash` (and `PirateRealm_cap.ash`'s own `statCheck()`,
not yet fixed) checked `my_buffedstat(st) > 100` when PirateRealm actually
requires stats strictly under 100 -- a stat sitting at exactly 100 was
treated as fine, so PirateRealm's sail-away step looped forever. Fixed
ASH-side (not part of this port). Also, `main.ts` had its own bug: it
called `run("pvp_safety")` (the function name) instead of `run("pvp-safety")`
(the actual filename, hyphenated) -- `cliExecute` resolves by filename, not
by the function inside it. Fixed, and cross-checked every other
`cliExecute`/`run` target against the files on disk afterward.

`check_tickets` porting note: the ASH source writes `$item[Rubee&trade;]`
and `$item[FunFunds&trade;]` using the HTML entity for ™. libram's `$item`
tag wants the actual Unicode ™ character, not the entity text -- confirmed
against the InstantSCCS reference project's own usage
(`` $item`Lil' Doctor™ bag` ``, etc.) before assuming so.

`file_to_map` vs `fileToArray`, if `store_mall_data` ever gets revisited:
ASH's `file_to_map` (`RuntimeLibrary.java`, `file_to_map`) parses each line
as tab-separated `key\tvalue` and preserves the file's real keys. The
naive-looking JS equivalent, `fileToArray`, is a *different* Java method
(`file_to_array`) that just reads raw lines and assigns fresh sequential
keys starting at 1, with no tab-splitting -- using it on this file would
silently corrupt the merge logic. The real equivalent is `fileToMap`/
`mapToFile`, untested here.

Note when porting: ASH truncates `int / int`, JavaScript does not. Check every
division as it crosses.

## Status: migration done, now improving on the original

Every day-to-day decision `daily-cap.ash` used to make -- what to run, in
what order, whether to ascend, how much to garbo, when to stop -- now
happens natively in `cap`'s TypeScript. `daily-cap` still exists, untouched,
and both can run side by side. The migration itself has no more open items;
what follows is improvements beyond what the ASH version ever did.

### Multi-day ascensions (2026-09-07)

The ASH version assumed an ascension always finishes inside a single day's
run: trigger it, play it out, and if it isn't done by the time `main()`
reaches `check_prism()`, that's treated as an error and the whole script
aborts. Fine for `sccs`/`smol`, which are expected to always finish same-day
-- if one doesn't, that's a bug worth surfacing loudly, not silently working
around. Not fine for `boris`/`standard`, which run on `autoscend` and
routinely span multiple days; `autoscend` breaks cleanly on turn-exhaustion
rather than erroring.

`main.ts` now distinguishes three states instead of two: already ascended
today, a fresh day (run the normal morning-aftercore-then-trigger flow), or
an ascension already in progress from a previous day (`ascensionsToday ==
0` and `kingLiberated == false` at the very start -- `kingLiberated` flips
true only when the prism breaks, right at the *end* of a run, not the
start).

That third state doesn't trust `--path` to say which ascension is actually
in progress -- you might have run `cap boris` on day 1 and just typed bare
`cap` on day 2, which would default `--path` back to `sccs`. Instead it
reads `myPath()` (the character's real current path, live from game state)
and, if that's `boris` or `standard`, shows a blocking `userConfirm()`
Yes/No dialog: *"cap detected an ascension already in progress: Avatar of
Boris. Resume it automatically?"* Yes resumes automatically; No throws and
forces you to sort it out by hand. If `myPath()` comes back as something
other than boris/standard while ascensionsToday is 0 (i.e. sccs/smol
mid-run -- the bug case above), there's no prompt at all; it falls through
to the normal flow and `check_prism()`'s abort, same as always.

Once confirmed, the detected path (not `--path`) drives everything else for
the rest of the run -- skips morning aftercore, `do_pvp`,
`sccs_preparation` and `trigger_*_ascension` entirely (no starting a second
ascension on top of the stalled one) and jumps straight to re-running
`autoscend` to continue it.

After the ascension-content block runs (whether freshly triggered this run
or resumed), `boris`/`standard` get one more check before the old
unconditional `check_prism()` assertion: if `ascensionsToday` is still `0`,
that's a normal "ran out of turns again" outcome, not a bug -- stop cleanly
as a rest day (skipping the S.I.T. course, aftercore, `do_pvp`, and
`end_of_day`, none of which make sense for a low-level mid-ascension
character) rather than letting `check_prism()` abort. The closing
`store_mall_data`/`check_mall_prices` pair still runs even on a rest day --
purely informational, no reason to skip it. `sccs`/`smol` keep the original
unconditional-abort behavior unchanged.

Confirmed working 2026-09-08: a real Boris ascension spanned multiple days
and resumed correctly.

### Standard-path class selection (2026-09-08)

`paths/standard/trigger_standard_ascension.ash` hardcoded `whichclass=1`
(Seal Clubber). Ported it to `src/lib/triggerStandardAscension.ts` and added
a `--class` CLI option (`seal-clubber`, `turtle-tamer`, `pastamancer`,
`sauceror`, `disco-bandit`, `accordion-thief`, defaulting to
`seal-clubber`) so it's selectable per run, validated by grimoire's `Args`
the same way `--path`/`--farm` are -- a typo is rejected before `main()`
runs, not silently sent to `ascend.php` as class 0 or similar. Only wired
up for `standard`; `sccs`/`boris`/`smol` stay exactly as hardcoded as they
were, per explicit request -- no need to generalize further than asked.

The class-name-to-id mapping (`STANDARD_CLASS_IDS` in
`triggerStandardAscension.ts`) came directly from the user, not guessed --
the ASH source's own comment on this (`// SC=1, TT=2, PM=3, SA=4, ???`) was
incomplete and not a trustworthy source of truth. Its keys must stay in
sync with the `class` Args option in `main.ts`; there's a comment at each
pointing to the other, but nothing enforces it mechanically.
