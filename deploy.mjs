// @ts-check
import { readFileSync, existsSync } from "fs";
import { runReleaseCheck } from "./release-check.mjs";

// Minimal .env loader (no external deps)
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[k] = v;
  }
}

const version = JSON.parse(readFileSync("./package.json", "utf-8")).version;

const API = "https://ja.wikipedia.org/w/api.php";
const USER_PAGE_BASE = "利用者:鈴音雨/WKSpinner";

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

const PAGE_NAMES = ["preferences", "debug", "watchlistUsers"];

const APPLY = process.argv.includes("--yes");
const EDIT_INTERVAL_MS = 20000;
const SUMMARY = `WKSpinner 更新 v${version} (auto-deploy)`;

/**
 * @returns {{title: string, file: string, body: string}[]}
 */
function collect() {
  const targets = [];
  const coreFile = "./dist/index.js";
  if (!existsSync(coreFile)) {
    throw new Error("dist/index.js not found. Run `pnpm run build` first.");
  }
  targets.push({
    title: `${USER_PAGE_BASE}.js`,
    file: coreFile,
    body: readFileSync(coreFile, "utf8"),
  });

  for (const name of MODULE_NAMES) {
    const file = `./dist/modules/${name}.js`;
    if (!existsSync(file)) {
      throw new Error(`${file} not found. Run \`pnpm run build\` first.`);
    }
    targets.push({
      title: `${USER_PAGE_BASE}/modules/${name}.js`,
      file,
      body: readFileSync(file, "utf8"),
    });
  }

  for (const name of PAGE_NAMES) {
    const file = `./dist/pages/${name}.js`;
    if (!existsSync(file)) {
      throw new Error(`${file} not found. Run \`pnpm run build\` first.`);
    }
    targets.push({
      title: `${USER_PAGE_BASE}/pages/${name}.js`,
      file,
      body: readFileSync(file, "utf8"),
    });
  }

  const cssFile = "./styles/WKSpinner.css";
  if (existsSync(cssFile)) {
    targets.push({
      title: `${USER_PAGE_BASE}.css`,
      file: cssFile,
      body: readFileSync(cssFile, "utf8"),
    });
  } else {
    console.warn(`[warn] ${cssFile} not found. Skipping CSS deploy.`);
  }
  return targets;
}

const cookieMap = new Map();
let cookieHeader = "";

/** @param {Record<string, any>} params */
async function api(params) {
  const body = new URLSearchParams(params).toString();
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent":
        "WKSpinner-deploy/1.0 (https://github.com/waki285/WKSpinner)",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body,
  });
  const setCookies =
    // @ts-ignore: getSetCookie is available in Node 20+
    res.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    for (const c of setCookies) {
      const [pair] = c.split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) {
        cookieMap.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }
    }
    cookieHeader = [...cookieMap.entries()]
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
  return res.json();
}

async function login() {
  const username = process.env.WKS_BOT_USERNAME;
  const password = process.env.WKS_BOT_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "WKS_BOT_USERNAME and WKS_BOT_PASSWORD must be set (env, .env, or shell).",
    );
  }

  // Bot passwords use the legacy action=login, not clientlogin.
  // clientlogin is the human UI flow and triggers CAPTCHA.
  const tokenRes = await api({
    action: "query",
    meta: "tokens",
    type: "login",
    format: "json",
    formatversion: "2",
  });
  const loginToken = tokenRes?.query?.tokens?.logintoken;
  if (!loginToken) {
    throw new Error(`Failed to get login token: ${JSON.stringify(tokenRes)}`);
  }

  const loginRes = await api({
    action: "login",
    format: "json",
    lgname: username,
    lgpassword: password,
    lgtoken: loginToken,
  });
  if (loginRes?.login?.result !== "Success") {
    throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
  }
  console.log("[info] Logged in.");
}

async function getCsrf() {
  const res = await api({
    action: "query",
    meta: "tokens",
    format: "json",
    formatversion: "2",
  });
  const token = res?.query?.tokens?.csrftoken;
  if (!token) {
    throw new Error(`Failed to get csrf token: ${JSON.stringify(res)}`);
  }
  return token;
}

/**
 * Fetch remote page content for exact comparison.
 * MediaWiki's SHA-1 can differ from a local hash due to newline normalisation
 * and other server-side transforms, so we compare the actual wikitext.
 * @param {string} title
 * @returns {Promise<string | null>} remote wikitext (null if page is missing)
 */
async function getRemoteContent(title) {
  const res = await api({
    action: "query",
    prop: "revisions",
    titles: title,
    rvprop: "content",
    rvslots: "main",
    format: "json",
    formatversion: "2",
  });
  const page = res?.query?.pages?.[0];
  if (!page || page.missing) {
    return null;
  }
  return page.revisions?.[0]?.slots?.main?.content ?? null;
}

/**
 * @param {string} title
 * @param {string} text
 * @param {string} csrf
 * @param {string} summary
 */
async function editPage(title, text, csrf, summary) {
  const res = await api({
    action: "edit",
    format: "json",
    formatversion: "2",
    title,
    text,
    summary,
    token: csrf,
    bot: 1,
    minor: 1,
  });
  if (res?.edit?.result !== "Success") {
    throw new Error(`Edit failed for ${title}: ${JSON.stringify(res)}`);
  }
  return res.edit;
}

async function main() {
  await runReleaseCheck();
  const targets = collect();

  console.log("[info] Logging in...");
  await login();
  const csrf = await getCsrf();

  let changed = 0;
  let skipped = 0;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const remote = await getRemoteContent(t.title);
    // MediaWiki strips trailing newlines on save, so normalise both sides
    // before comparing to avoid spurious updates.
    const normalize = (s) => s.replace(/\n+$/, "");
    if (remote !== null && normalize(remote) === normalize(t.body)) {
      console.log(`[skip] ${t.title} (unchanged)`);
      skipped += 1;
      continue;
    }
    if (remote === null) {
      console.log(`[create] ${t.title}`);
    } else {
      console.log(`[update] ${t.title}`);
    }
    if (!APPLY) {
      console.log(`  (dry-run) size=${t.body.length} bytes`);
      changed += 1;
      continue;
    }
    await editPage(t.title, t.body, csrf, SUMMARY);
    changed += 1;
    if (i < targets.length - 1) {
      console.log(
        `  (waiting ${EDIT_INTERVAL_MS / 1000}s before next edit...)`,
      );
      await new Promise((r) => setTimeout(r, EDIT_INTERVAL_MS));
    }
  }

  console.log(`\n[done] summary: ${SUMMARY}`);
  console.log(`[done] changed=${changed} skipped=${skipped}`);
  if (!APPLY && changed > 0) {
    console.log("[info] dry-run mode. Run with --yes to actually deploy.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
