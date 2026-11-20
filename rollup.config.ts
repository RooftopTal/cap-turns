import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import type { RollupOptions } from "rollup";

const extensions = [".js", ".ts"];

// Set CAP_OUT to your mafia scripts folder to build straight into the game.
// That is the folder mafia actually loads cap.js from -- currently:
//   CAP_OUT="C:/work/kolmafia/scripts/cap-turns" npm run watch
// Forgetting it is the classic "my fix didn't do anything" bug: the build
// succeeds, but into the repo tree below, and the game keeps running the
// last copy that was written to the scripts folder.
// Left unset, it builds into KoLmafia/ (gitignored). CI builds the same way and
// publishes that tree to the `release` branch, which is what mafia installs.
const outDir = process.env.CAP_OUT ?? "KoLmafia/scripts/cap-turns";
// Relay pages have to sit directly in mafia's relay folder to show up in the
// relay browser's script dropdown. CAP_RELAY_OUT does for them what CAP_OUT
// does for scripts.
const relayDir = process.env.CAP_RELAY_OUT ?? "KoLmafia/relay";

function script(name: string, input: string, dir = outDir): RollupOptions {
  return {
    input,
    output: {
      file: `${dir}/${name}.js`,
      format: "cjs",
    },
    // The kolmafia package is types only; the real functions are injected by
    // mafia at runtime, so it must never be bundled.
    external: ["kolmafia"],
    plugins: [
      resolve({ extensions }),
      commonjs(),
      babel({
        babelHelpers: "bundled",
        extensions,
        babelrc: false,
        presets: [
          [
            "@babel/preset-env",
            {
              targets: { rhino: "1.8.0" },
            },
          ],
          "@babel/preset-typescript",
        ],
        // Rhino chokes on core-js's polyfills (which useBuiltIns: "usage"
        // would pull in) -- see InstantSCCS, which targets the same runtime
        // and skips them too. These two transforms are what it uses instead.
        plugins: [
          "@babel/plugin-transform-property-literals",
          "@babel/plugin-transform-member-expression-literals",
        ],
      }),
    ],
  };
}

export default [
  script("cap", "src/main.ts"),
  script("mall-prices", "src/mallPrices.ts"),
  script("relay_Cap_Mall_Prices", "src/relay/capMallPrices.ts", relayDir),
];
