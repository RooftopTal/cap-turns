# cap-turns

Captain Yaksworth's daily turns, in TypeScript. Successor to the ASH scripts in
`<mafia>/scripts/cap`, which still run the actual day until the port is done.

## Layout

    src/              what you edit
    src/lib/          shared helpers (cliRun, constants)
    src/ascensions/   triggering/running ascensions
    src/consumption/  diet bits outside CONSUME (nightcap, stooper)
    src/daily/        daily chores and end-of-day
    src/farming/      aftercore loop and garbo wrapper
    src/mall/         mall prices, coinmaster tickets, price overrides
    src/pvp/          PvP
    src/realms/       PirateRealm/FantasyRealm
    KoLmafia/         local build output (gitignored)
    .github/          CI: builds main and publishes it to the `release` branch

## Developing

Build straight into the mafia scripts folder and leave it watching:

    CAP_OUT="C:/work/kolmafia/scripts/cap-turns" npm run watch

Then in the gCLI, `cap --help`. The old ASH is still invocable as `daily-cap`,
so you can run both side by side.

`mall-prices` runs just the mall price report (`src/mall/checkMallPrices.ts`)
without a whole day. Typing `check_mall_prices` still runs the old ASH copy in
`scripts/cap/mall/`, which no longer gets updates.

Windows cmd:

    set CAP_OUT=C:\work\kolmafia\scripts\cap-turns
    npm run watch

`CAP_OUT` must be the folder mafia actually loads `cap.js` from -- check a
stack trace in the gCLI if in doubt, it prints the real path. Without it the
build lands in `KoLmafia/` below and the game happily keeps running whatever
was last written to the scripts folder, so a fix looks like it did nothing.

## Other commands

    npm run check     tsc, no emit
    npm run build     build into KoLmafia/ (what CI does before publishing)

## Installing via mafia

Every push to `main` triggers `.github/workflows/release.yml`, which typechecks,
builds, and force-pushes just `scripts/cap-turns/` to the `release` branch. Mafia
installs from that branch, once, in the gCLI:

    git checkout https://github.com/RooftopTal/cap-turns release

After that, `git update` (or `gitUpdateOnLogin`, already on) keeps it current --
no copying. If a push doesn't show up, check the Actions tab: a failed `check`
or build means nothing was published.

`CAP_OUT` dev builds still write into the same `scripts/cap-turns` folder, so
for quick iteration nothing changes; the next update from `release` simply
overwrites them with the pushed version.

## Migration status

Ported:

- `general/day_ahead.ash` -> `src/daily/day.ts`
- `realms/go_to_piraterealm.ash`, `realms/go_to_fantasyrealm.ash` -> `src/realms/realms.ts`
- tuning constants from `daily-cap.ash` -> `src/lib/constants.ts`
- `check_for_input()` argument parsing -> grimoire `Args` in `src/main.ts`
- `main()` from `daily-cap.ash`, transcribed into `src/main.ts`
- `safe_garbo` -> `src/farming/cap_garbo.ts` (named to avoid confusion with the
  actual `garbo` script/library referenced constantly via `cliExecute`; now
  calls `goToPirateRealm`/`goToFantasyRealm` from `src/realms/realms.ts`
  directly instead of the ASH versions)
- `aftercore_actions`, `trick_or_treat` -> `src/farming/aftercore.ts`
- `generic_loop_stuff` -> `src/farming/loop.ts`
- `do_pvp` -> `src/pvp/pvp.ts`
- `end_of_day` -> `src/daily/endOfDay.ts` (folding in its local
  `buy_meat_golem` helper; `join_raffle` lives in `src/daily/raffle.ts`)
- `pick_lock` -> `src/daily/pickLock.ts`, `set_sit_course` ->
  `src/daily/setSitCourse.ts` (both now use libram's `withChoice` instead of
  manual save/set/restore of the choice preference -- see the pick_lock bug
  below, which withChoice makes structurally impossible to repeat)
- `use_censer` -> `src/daily/useCenser.ts`
- `take_meteorite_ade` -> `src/pvp/takeMeteoriteAde.ts`
- `clear_pledge` -> `src/daily/clearPledge.ts`
- `drink_nightcap` -> `src/consumption/drinkNightcap.ts`, `stooper_drink` ->
  `src/consumption/stooperDrink.ts`
- `open_beach` -> `src/daily/openBeach.ts`
- `check_tickets` -> `src/mall/tickets.ts`
- `check_mall_prices` -> `src/mall/checkMallPrices.ts` (2026-09-30)
- `mall_overrides.ash` -> `src/mall/overrides.ts`

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
- The ascension scripts (`sccs_preparation`,
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
unconditional `check_prism()` assertion: if `kingLiberated` is still
`false`, that's a normal "ran out of turns again" outcome, not a bug --
stop cleanly as a rest day (skipping the S.I.T. course, aftercore,
`do_pvp`, and `end_of_day`, none of which make sense for a low-level
mid-ascension character) rather than letting `check_prism()` abort. The
closing `store_mall_data`/`check_mall_prices` pair still runs even on a
rest day -- purely informational, no reason to skip it. `sccs`/`smol` keep
the original unconditional-abort behavior unchanged.

Confirmed working 2026-09-08: a real Boris ascension spanned multiple days
and resumed correctly. Same day, a second bug turned up and got fixed: this
rest-day check originally read `ascensionsToday === 0`, not
`!kingLiberated`. That's wrong -- confirmed straight from
`trigger_boris_ascension.ash`, every `trigger_*_ascension` function's first
action is submitting the *previous* run's ascend button, which sends the
character through Valhalla and increments `ascensionsToday`
(`ValhallaManager.onAscension()` in mafia's own source) *before* the newly
triggered run has done anything. So `ascensionsToday` goes nonzero the
instant any trigger fires, whether or not that run ever finishes, making it
useless for telling "just started" apart from "actually done" within the
same script run. Caught because the character had completed an earlier,
unrelated ascension the same real-world day before running `cap path
boris` -- `ascensionsToday` was already 1 by the time the Boris run's own
completion was being checked, so the rest-day check saw "nonzero" and
(wrongly) fell through to `check_prism()`'s abort. `kingLiberated` doesn't
have this problem -- it tracks the ascension actually in progress, not a
same-day cumulative count.

That same discovery exposed one more gap: the resume-detection block
(`myPath()` check + `userConfirm()` popup) was gated behind `!ascendedAlready`
too, so on a same-day rerun after an earlier unrelated ascension already
completed (`ascendedAlready` true), it would never even fire -- you'd have
had to remember to pass `--path boris` explicitly again to get back into the
right branch, defeating the point of auto-detecting via `myPath()` in the
first place. Decoupled: the resume check now runs whenever `kingLiberated`
is false, full stop, and `resumingAscension` takes priority over
`ascendedAlready` in the top-level branch. A bare `cap` now correctly
detects and offers to resume an in-progress boris/standard ascension
regardless of what else ascended earlier that day.

### Standard-path class selection (2026-09-08)

`paths/standard/trigger_standard_ascension.ash` hardcoded `whichclass=1`
(Seal Clubber). Ported it to `src/ascensions/triggerStandardAscension.ts` and added
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

### PirateRealm's 40-adventure floor (2026-09-09)

A voyage can't be started below 40 adventures, which is easy to be under
coming straight out of an ascension. `PirateRealm_cap.ash`'s run loop
handles this by printing "You'll need forty adventures to start" and
returning *silently* -- no abort, no false return -- so `safe_garbo`'s
Trash Island run looked like it had happened and then blew up on the
`_lastPirateRealmIsland` assertion (`"Trash failed somehow?"`) instead of
saying what was actually wrong.

`src/realms/pirateRealmTurns.ts` now gates the voyage on the real turn count.
`safeGarbo` calls `ensureAdventuresForPirateRealm()` before the
`crab trashonly` run, and it either gets us over the line or says PirateRealm
is off for the day.

The Trash Island run happens *before* garbo, so none of the day's diet has
been eaten yet -- and garbo wants that diet for its own early, high-value
turns. So the top-up eats as little as gets us to sea: one `mini kiwi aioli`
(worth +1 adventure per point of fullness) followed by one food, re-checking
the turn count after each, until we clear 40 or run out of sensible options.
`TOP_UP_FOODS` is tried in order -- `roasted vegetable focaccia`, then
`baked veggie ricotta casserole`, both 2 fullness for 15-17 adventures and
both staples of this character's real diets. A food is skipped if it won't
fit in the remaining stomach, or if it plus its aioli costs more than
`getAverageAdventures() * valueOfAdventure`. A 22-turn gap costs about two
of them, ie 4 fullness.

**Do not reach for CONSUME here.** Its `ORGANS x y z` argument is a
*starting* budget, not a cap: `get_diet()` (CONSUME.ash:1113) is handed the
real `fullness_limit()/inebriety_limit()/spleen_limit()` as its `max`, and
the expander and cleaner passes (`sweet tooth`, `distention pill`,
`mojo filter`, `spice melange`, `synthetic dog hair pill`, `Sweat Out Some
Booze`, `Aug. 16th: Roller Coaster Day!`) grow the request up to *that*, not
up to what was asked for. The first version of this code asked for
`ORGANS 9 0 10` and got a plan filling "15 fullness, 7 liver, and 13 spleen"
-- the entire day's diet, 714k meat, 18 -> 181 adventures -- with liver
filled to 7 despite an explicit 0, because liver cleaners manufacture space
from zero (session log 2026-09-09, line 47558).

Failing to reach 40 (or having no stomach space to begin with) means
PirateRealm is skipped *entirely* for the day rather than half-attempted:
`pirateRealmBlocked` suppresses the Trash Island run, drops
`TURNS_FOR_PIRATEREALM` from garbo's turn budget, and skips the later
`storm`/`any` visit. The `target=cockroach` garbo flag turns itself off for
free, since it keys off `_lastPirateRealmIsland`, which stays unset.

The gate only fires where a voyage is actually *started* (not on Trash
Island and `_questPirateRealm` unfinished). Continuing a voyage already in
progress has no turn floor, so the later `PirateRealm_cap storm`/`any` call
is left alone in that case.

The only "impractical" tests are the two above -- no stomach space, or no
food worth its price. There's no cap on how many bites it'll take, because
each one is re-checked and the loop stops the moment 40 is in hand.

### Post-ascension adventure value (2026-09-09)

The loop values a turn at `VALUE_MORNING` (6500) in the first half of the
day and `VALUE_EVENING` (6000) in the second. A day that finishes a
multi-day ascension fits neither: `main()` skips the morning leg entirely to
resume the ascension, so the leg that runs afterwards is the day's *first*
farming even though it occupies the evening slot -- full day's turns ahead
of it, but it still ends at the nightcap.

`VALUE_POST_ASCENSION` (the midpoint, 6250) is used for exactly that leg.
`resumingAscension` is the test: reaching the evening leg with it set means
the ascension we resumed from a previous day also *finished* this run, since
an unfinished one returns early at the rest-day check above. A normal day
exits its ascension into the genuine second half and keeps 6000; the
following day's morning leg isn't exiting an ascension at all and keeps
6500.

Value only. The leg still holds back `TURNS_TO_SAVE_OVERNIGHT` and still
ends with the nightcap at `VALUE_NIGHTCAP`; `valueOverride` threads through
`runAftercoreLoop` into `aftercoreActions` and touches nothing else. The
seasonal farm modes (`--farm ween`/`crimbo`) set their own value and ignore
it.
