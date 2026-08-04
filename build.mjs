// @ts-check
import { context, transform } from "esbuild";
import { readFileSync } from "fs";

const version = JSON.parse(readFileSync("./package.json", "utf-8")).version;

const IS_DEV = process.env.NODE_ENV === "development";

/** @type {import("esbuild").Plugin} */
const cssTextPlugin = {
  name: "css-text",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async ({ path }) => {
      const source = readFileSync(path, "utf-8");
      const { code } = await transform(source, {
        loader: "css",
        minify: !IS_DEV,
      });
      return {
        contents: `export default ${JSON.stringify(code.trim())};`,
        loader: "js",
        watchFiles: [path],
      };
    });
  },
};

const ctx = await context({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  minify: !IS_DEV,
  sourcemap: IS_DEV ? "inline" : false,
  target: "esnext",
  outfile: "./dist/index.js",
  legalComments: "none",
  logLevel: "info",
  tsconfig: "./tsconfig.json",
  platform: "browser",
  format: "iife",
  allowOverwrite: true,
  plugins: [cssTextPlugin],
  banner: {
    js: `// *************************\n// @name WKSpinner\n// @namespace 鈴音雨\n// @author [[利用者:鈴音雨]]\n// @version ${version}\n// *************************\n// このスクリプトはDragoniez氏のAN Reporterを参考にして作られています\n// 解説ページ: [[利用者:鈴音雨/WKSpinner]]\n// スクリプトの設定: [[利用者:鈴音雨/WKSpinner/Preferences]]\n// このコードは圧縮されています！本来のコード: https://github.com/waki285/WKSpinner\n//<nowiki>\n/* global mw, $, OO */\n/* jshint ignore:start */\n`,
  },
  footer: {
    js: "/* jshint ignore:end */\n//</nowiki>",
  },
  charset: "utf8",
});

await ctx.rebuild();

process.exit(0);
