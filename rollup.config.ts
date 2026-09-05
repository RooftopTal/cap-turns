import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import type { RollupOptions } from "rollup";

const extensions = [".js", ".ts"];

// Set CAP_OUT to your mafia scripts folder to build straight into the game:
//   CAP_OUT="C:/Users/TimLedsam/Dropbox/kolmafia-data/scripts/cap-turns" npm run watch
// Left unset, it builds into the committed KoLmafia/ tree that `git checkout`
// installs from.
const outDir = process.env.CAP_OUT ?? "KoLmafia/scripts/cap";

function script(name: string, input: string): RollupOptions {
  return {
    input,
    output: {
      file: `${outDir}/${name}.js`,
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

export default [script("cap", "src/main.ts")];
