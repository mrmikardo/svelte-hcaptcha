import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import pkg from "./package.json";
import autoPreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, "$3")
  .replace(/^\w/, (m) => m.toUpperCase())
  .replace(/-\w/g, (m) => m[1].toUpperCase());

export default {
  input: "src/index.js",
  output: [
    { file: pkg.module, format: "es", sourcemap: !production },
    { file: pkg.main, format: "umd", name, sourcemap: !production },
  ],
  plugins: [
    svelte({
      preprocess: autoPreprocess(),
    }),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
    resolve(),
    terser(),
  ],
};
