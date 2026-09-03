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
- tuning constants from `daily-cap.ash` -> `src/lib/constants.ts`
- `check_for_input()` argument parsing -> grimoire `Args` in `src/main.ts`

Next (phase 2): `realms/go_to_piraterealm.ash` and `realms/go_to_fantasyrealm.ash`
-- the other two functions whose return values steer the day -- then transcribe
`main()` from `daily-cap.ash` with every action step as a `cliExecute` of the ASH
file it currently calls.

Note when porting: ASH truncates `int / int`, JavaScript does not. Check every
division as it crosses.
