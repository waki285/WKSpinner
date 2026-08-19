// @ts-check
import { context, transform } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { minify } from "terser";

const version = JSON.parse(readFileSync("./package.json", "utf-8")).version;

const IS_DEV = process.env.NODE_ENV === "development";
const IS_DEBUG_BUNDLE = process.argv.includes("--debug");

const MODULE_NAMES = [
  "csd",
  "csrd",
  "editCount",
  "mi",
  "rfp",
  "skj",
  "warn",
  "wikidata",
];

// Lazily loaded page bundles (settings pages, debug page, etc.).  These are
// only fetched when the user actually visits the corresponding wiki page, so
// keeping them out of the core bundle drastically reduces the page weight of
// ordinary article views.
const PAGE_NAMES = ["preferences", "debug"];

// ---------------------------------------------------------------------------
// Shared-module externalisation plugin
//
// Each lazy-loaded module bundle used to re-bundle util.ts, constants.ts,
// dialog/, issue-templates.ts and skj-validation.ts.  When one of those shared
// files changed, every module's output changed even though the module's own
// logic was untouched.
//
// The plugin below intercepts imports of those shared modules IN MODULE BUILDS
// ONLY and replaces them with a tiny virtual module that reads from
// `globalThis[Symbol.for("wkspinner.shared")]` — a registry populated by the
// core bundle (src/shared.ts).  As a result:
//   - Changing a module's own code only redeploys that module.
//   - Changing shared code only redeploys the core bundle.
// ---------------------------------------------------------------------------

/** @type {Record<string, { file: string, key: string }>} */
const SHARED_MODULES = {
  "@/util": { file: "./src/util.ts", key: "util" },
  "@/dialog": { file: "./src/dialog/index.ts", key: "dialog" },
  "@/skj-validation": { file: "./src/skj-validation.ts", key: "skjValidation" },
  "../util": { file: "./src/util.ts", key: "util" },
  "../dialog": { file: "./src/dialog/index.ts", key: "dialog" },
  "../skj-validation": {
    file: "./src/skj-validation.ts",
    key: "skjValidation",
  },
};

/**
 * Extract runtime (non-type) export names from a TypeScript source file.
 * @param {string} filePath
 * @returns {string[]}
 */
function getRuntimeExports(filePath) {
  const source = readFileSync(filePath, "utf8");
  const exports = new Set();

  // export const/let/var/function/class/async function name  (skip "export type")
  const reDecl =
    /export\s+(?!type\b)(?:const|let|var|function|class|async\s+function)\s+(\w+)/g;
  let m;
  while ((m = reDecl.exec(source)) !== null) {
    exports.add(m[1] ?? "");
  }

  // export { a, b, c }  (skip "export type { ... }")
  const reReExport = /export\s+(?!type\b)\{([^}]+)\}/g;
  while ((m = reReExport.exec(source)) !== null) {
    for (const part of (m[1] ?? "").split(",")) {
      let name = part.trim();
      if (name.startsWith("type ")) continue;
      name = (name.split(/\s+as\s+/)[0] ?? "").trim();
      if (name && !name.startsWith("//")) {
        exports.add(name);
      }
    }
  }

  return [...exports];
}

/** @type {import("esbuild").Plugin} */
const sharedExternalsPlugin = {
  name: "wkspinner-shared-externals",
  setup(build) {
    build.onResolve(
      {
        filter: /^(?:@\/|\.\.\/)(?:util|dialog|skj-validation)$/,
      },
      (args) => ({ path: args.path, namespace: "wkspinner-shared" }),
    );

    build.onLoad({ filter: /.*/, namespace: "wkspinner-shared" }, (args) => {
      const info = SHARED_MODULES[args.path];
      if (!info) {
        throw new Error(`Unknown shared module: ${args.path}`);
      }
      const names = getRuntimeExports(info.file);
      const lines = [
        `const _s = globalThis[Symbol.for("wkspinner.shared")].${info.key};`,
        ...names.map((n) => `export const ${n} = _s.${n};`),
      ];
      return { contents: lines.join("\n"), loader: "js" };
    });
  },
};

// ---------------------------------------------------------------------------

/** @type {import("esbuild").Plugin} */
const cssTextPlugin = {
  name: "css-text",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async ({ path }) => {
      const source = readFileSync(path, "utf-8");
      const { code } = await transform(source, {
        loader: "css",
        minify: !IS_DEV && !IS_DEBUG_BUNDLE,
      });
      return {
        contents: `export default ${JSON.stringify(code.trim())};`,
        loader: "js",
        watchFiles: [path],
      };
    });
  },
};

/** @type {import("esbuild").BuildOptions} */
const commonOptions = {
  bundle: true,
  minify: true,
  sourcemap: IS_DEV ? "inline" : false,
  target: "esnext",
  legalComments: "none",
  logLevel: "info",
  tsconfig: "./tsconfig.json",
  platform: "browser",
  format: "iife",
  allowOverwrite: true,
  write: false,
  external: ["vue", "@wikimedia/codex"],
  charset: "utf8",
  define: {
    __WKSPINNER_BUNDLED_DEBUG__: "false",
  },
};

const coreBanner = {
  js: `// *************************\n// @name WKSpinner\n// @namespace 鈴音雨\n// @author [[利用者:鈴音雨]]\n// @version ${version}\n// *************************\n// このスクリプトはDragoniez氏のAN Reporterを参考にして作られています\n// 解説ページ: [[利用者:鈴音雨/WKSpinner]]\n// スクリプトの設定: [[利用者:鈴音雨/WKSpinner/Preferences]]\n// このコードは圧縮されています！本来のコード: https://github.com/waki285/WKSpinner\n//<nowiki>\n/* global mw, $, OO */\n/* jshint ignore:start */\n`,
};

const coreFooter = {
  js: "/* jshint ignore:end */\n//</nowiki>",
};

const debugBanner = {
  js: `// *************************
// WKSpinner bundled debug build
// @version ${version}
// *************************
/* global mw, $, OO */
`,
};

const debugFooter = {
  js: "//# sourceURL=WKSpinner-debug.js",
};

// Module banners intentionally omit the version so that version bumps
// only redeploy dist/index.js, not every module file.
/** @param {string} name */
function moduleBanner(name) {
  return {
    js: `// *************************\n// WKSpinner module: ${name}\n// *************************\n//<nowiki>\n/* global mw */\n/* jshint ignore:start */\n`,
  };
}

const moduleFooter = {
  js: "/* jshint ignore:end */\n//</nowiki>",
};

/**
 * Apply terser to already-minified esbuild output to squeeze a few more bytes.
 * Banner/footer comments injected via esbuild are preserved by keeping all
 * comments in the output.
 * @param {string} code
 * @returns {Promise<string>}
 */
async function postMinify(code) {
  if (IS_DEV) {
    return code;
  }
  const result = await minify(code, {
    ecma: 2022,
    compress: { passes: 2 },
    mangle: true,
    format: { comments: "all" },
  });
  if (result.code === undefined) {
    throw new Error("terser returned no code");
  }
  return result.code;
}

/**
 * @param {import("esbuild").BuildOptions} options
 */
async function buildEntry(options) {
  const ctx = await context(options);
  const result = await ctx.rebuild();
  await ctx.dispose();
  const outfile = options.outfile;
  if (!outfile || !result.outputFiles || result.outputFiles.length === 0) {
    throw new Error("entry produced no output files");
  }
  const generated = result.outputFiles[0];
  if (!generated) {
    throw new Error("entry produced no output");
  }
  const minified = options.minify
    ? await postMinify(generated.text)
    : generated.text;
  mkdirSync(dirname(outfile), { recursive: true });
  writeFileSync(outfile, minified);
}

if (IS_DEBUG_BUNDLE) {
  await buildEntry({
    ...commonOptions,
    entryPoints: ["./src/debug-bundle.entry.ts"],
    outfile: "./dist/debug.js",
    banner: debugBanner,
    footer: debugFooter,
    plugins: [cssTextPlugin],
    minify: false,
    minifySyntax: true,
    sourcemap: false,
    define: {
      __WKSPINNER_BUNDLED_DEBUG__: "true",
    },
  });
  process.exit(0);
}

// Core bundle — includes all shared modules and registers them on globalThis.
await buildEntry({
  ...commonOptions,
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/index.js",
  banner: coreBanner,
  footer: coreFooter,
  plugins: [cssTextPlugin],
});

// Module bundles — shared code is externalised via the plugin.
for (const name of MODULE_NAMES) {
  await buildEntry({
    ...commonOptions,
    entryPoints: [`./src/modules/${name}.entry.ts`],
    outfile: `./dist/modules/${name}.js`,
    banner: moduleBanner(name),
    footer: moduleFooter,
    plugins: [cssTextPlugin, sharedExternalsPlugin],
  });
}

// Page bundles — also externalise shared code; only fetched when the user
// visits the matching wiki page (e.g. the Settings or Debug page).
for (const name of PAGE_NAMES) {
  await buildEntry({
    ...commonOptions,
    entryPoints: [`./src/${name}.entry.ts`],
    outfile: `./dist/pages/${name}.js`,
    banner: moduleBanner(name),
    footer: moduleFooter,
    plugins: [cssTextPlugin, sharedExternalsPlugin],
  });
}

process.exit(0);
