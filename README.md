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

`cap` runs the whole day natively in TypeScript now. What's left ASH-side and
still reached via `cliExecute`: `check_prism`, `break_hippy_stone`, `psychic`,
`clan_peridot`, `crimbone` (nothing to port there yet -- its real logic is
commented out in the source), plus the mall/ascension scripts
(`check_mall_prices`, `store_mall_data`, `sccs_preparation`,
`trigger_*_ascension`, `run_sccs_ascension`, `pvp-safety`) which were always
separate files and probably don't need porting at all. `store_mall_data` is
deliberately still last -- see below.

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

Next (phase 5, whenever it's worth revisiting): `store_mall_data.ash`'s
`file_to_map`/`map_to_file` round-trip is the fiddliest thing in the
codebase and the least urgent -- left for last on purpose, same as the
original plan called out. Otherwise the day-to-day logic is fully ported;
what's left ASH-side is either trivial delegation (`check_prism`,
`break_hippy_stone`) or other people's scripts this was never going to own
(`psychic`, `clan_peridot`, the mall/ascension scripts, `crimbone`).

Note when porting: ASH truncates `int / int`, JavaScript does not. Check every
division as it crosses.
