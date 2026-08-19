// @ts-check
import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const PACKAGE_FILE = "package.json";
const CONSTANTS_FILE = "src/constants.ts";
const CORE_BUNDLE_FILE = "dist/index.js";

/**
 * @param {string} packageText
 * @param {string} constantsText
 * @returns {{version: string | null, errors: string[]}}
 */
export function validateReleaseSource(packageText, constantsText) {
  const errors = [];
  let version = null;

  try {
    const packageJson = JSON.parse(packageText);
    if (
      typeof packageJson.version !== "string" ||
      !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(packageJson.version)
    ) {
      errors.push("package.json has an invalid version.");
    } else {
      version = packageJson.version;
    }
  } catch (error) {
    errors.push(`package.json could not be parsed: ${String(error)}`);
  }

  const devMatch = /export\s+const\s+DEV\s*=\s*(true|false)\s*;/u.exec(
    constantsText,
  );
  if (!devMatch) {
    errors.push("src/constants.ts does not declare DEV as a boolean literal.");
  } else if (devMatch[1] !== "false") {
    errors.push("DEV must be false for a release build.");
  }

  const sourceVersionMatch =
    /export\s+const\s+VERSION\s*=\s*["']([^"']+)["']\s*;/u.exec(constantsText);
  if (!sourceVersionMatch) {
    errors.push(
      "src/constants.ts does not declare VERSION as a string literal.",
    );
  } else if (version !== null && sourceVersionMatch[1] !== version) {
    errors.push(
      `Version mismatch: package.json=${version}, src/constants.ts=${sourceVersionMatch[1]}.`,
    );
  }

  return { version, errors };
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 * @param {"inherit" | "pipe"} stdio
 */
function run(command, args, cwd, stdio = "inherit") {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio,
    shell: false,
  });
  if (result.error) {
    throw result.error;
  }
  return result;
}

/**
 * @param {string} script
 * @param {string} cwd
 */
function runPnpmScript(script, cwd) {
  let pnpmCli = process.env.npm_execpath;
  if (!pnpmCli && process.platform === "win32") {
    const where = run("where.exe", ["pnpm.cmd"], cwd, "pipe");
    const shim = String(where.stdout).split(/\r?\n/u)[0]?.trim();
    if (where.status === 0 && shim) {
      const candidate = resolve(
        dirname(shim),
        "node_modules/pnpm/bin/pnpm.mjs",
      );
      if (existsSync(candidate)) {
        pnpmCli = candidate;
      }
    }
  }
  if (pnpmCli) {
    return run(process.execPath, [pnpmCli, script], cwd);
  }
  return run("pnpm", [script], cwd);
}

/**
 * @param {string} cwd
 * @returns {string[]}
 */
function getGitWarnings(cwd) {
  const warnings = [];
  const status = run("git", ["status", "--porcelain"], cwd, "pipe");
  if (status.status !== 0) {
    warnings.push("Git working tree status could not be checked.");
    return warnings;
  }
  if (String(status.stdout).trim()) {
    warnings.push("Git working tree has uncommitted or untracked changes.");
  }

  const upstream = run(
    "git",
    ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"],
    cwd,
    "pipe",
  );
  if (upstream.status !== 0) {
    warnings.push("The current branch has no upstream branch.");
    return warnings;
  }

  const upstreamName = String(upstream.stdout).trim();
  const counts = run(
    "git",
    ["rev-list", "--left-right", "--count", `HEAD...${upstreamName}`],
    cwd,
    "pipe",
  );
  if (counts.status !== 0) {
    warnings.push(
      `Git synchronization with ${upstreamName} could not be checked.`,
    );
    return warnings;
  }

  const [aheadText, behindText] = String(counts.stdout).trim().split(/\s+/u);
  const ahead = Number(aheadText);
  const behind = Number(behindText);
  if (ahead > 0 || behind > 0) {
    warnings.push(
      `The current branch is not synchronized with ${upstreamName} (ahead ${ahead}, behind ${behind}).`,
    );
  }
  return warnings;
}

/**
 * @param {string} coreBundle
 * @param {string} version
 * @returns {string[]}
 */
export function validateCoreBundle(coreBundle, version) {
  const errors = [];
  if (!coreBundle.includes(`// @version ${version}`)) {
    errors.push(`dist/index.js does not contain release version ${version}.`);
  }
  if (coreBundle.includes("sourceMappingURL=data:")) {
    errors.push("dist/index.js contains an inline source map.");
  }
  return errors;
}

/**
 * @param {{cwd?: string}} [options]
 */
export async function runReleaseCheck(options = {}) {
  const cwd = resolve(options.cwd ?? process.cwd());
  console.log("[release-check] Checking release metadata...");

  const source = validateReleaseSource(
    readFileSync(resolve(cwd, PACKAGE_FILE), "utf8"),
    readFileSync(resolve(cwd, CONSTANTS_FILE), "utf8"),
  );
  if (source.errors.length > 0 || source.version === null) {
    throw new Error(
      `Release metadata check failed:\n- ${source.errors.join("\n- ")}`,
    );
  }
  console.log(`[release-check] Version ${source.version}, DEV=false`);

  const warnings = getGitWarnings(cwd);
  for (const warning of warnings) {
    console.warn(`[release-check] warning: ${warning}`);
  }

  for (const script of ["test", "lint", "build"]) {
    console.log(`[release-check] Running pnpm ${script}...`);
    const result = runPnpmScript(script, cwd);
    if (result.status !== 0) {
      throw new Error(`pnpm ${script} failed with exit code ${result.status}.`);
    }
  }

  const bundleErrors = validateCoreBundle(
    readFileSync(resolve(cwd, CORE_BUNDLE_FILE), "utf8"),
    source.version,
  );
  if (bundleErrors.length > 0) {
    throw new Error(
      `Release bundle check failed:\n- ${bundleErrors.join("\n- ")}`,
    );
  }

  console.log(
    `[release-check] PASS${warnings.length > 0 ? ` with ${warnings.length} warning(s)` : ""}.`,
  );
}

const entryFile = process.argv[1] ? resolve(process.argv[1]) : "";
if (fileURLToPath(import.meta.url) === entryFile) {
  runReleaseCheck().catch((error) => {
    console.error(`[release-check] FAIL: ${String(error)}`);
    process.exitCode = 1;
  });
}
