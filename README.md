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
- `safe_garbo` -> `src/lib/garbo.ts` (now calls `goToPirateRealm`/
  `goToFantasyRealm` from `src/lib/realms.ts` directly instead of the ASH
  versions)
- `aftercore_actions`, `trick_or_treat` -> `src/lib/aftercore.ts`
- `generic_loop_stuff` -> `src/lib/loop.ts`
- `do_pvp` -> `src/lib/pvp.ts`
- `end_of_day` -> `src/lib/endOfDay.ts` (folding in its local
  `buy_meat_golem`/`join_raffle` helpers)

`cap` runs the whole day natively in TypeScript now. What's left ASH-side and
still reached via `cliExecute` (phase 4): `check_prism`, `set_sit_course`,
`clear_pledge`, `use_censer`, `pick_lock`, `take_meteorite_ade`,
`break_hippy_stone`, `stooper_drink`, `drink_nightcap`, `open_beach`,
`check_tickets`, `crimbone` (nothing to port there yet -- its real logic is
commented out in the source), plus the mall/ascension scripts
(`check_mall_prices`, `store_mall_data`, `sccs_preparation`,
`trigger_*_ascension`, `run_sccs_ascension`, `pvp_safety`) which were always
separate files and probably don't need porting at all.

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

Next (phase 4): the small helpers -- `pick_lock`, `use_censer`,
`take_meteorite_ade`, `set_sit_course`, `clear_pledge`, `drink_nightcap`,
`stooper_drink`, `open_beach`, `check_tickets`. Leave `store_mall_data.ash`
for last; its `file_to_map`/`map_to_file` round-trip is the fiddliest thing
in the codebase and the least urgent.

Note when porting: ASH truncates `int / int`, JavaScript does not. Check every
division as it crosses.
