import {
  CONFIG_PAGE_NAME,
  DEBUG_PAGE_NAME,
  OPTIONS_KEY,
  ORIG_PORTLET_ID,
  PORTLET_LABEL,
  RELEASE_NOTES,
  SCRIPT_NAME,
  VERSION,
  VERSION_OPTIONS_KEY,
  WATCHLIST_USERS_PAGE_NAME,
} from "./constants";
import { applyOptionMigrations } from "./option-migrations";
import "./shared";
import {
  createPortletLink,
  getOptionProperty,
  getSavedOptions,
  loadLibrary,
} from "./util";
import cmp from "semver-compare";
import BUNDLED_STYLE from "../styles/WKSpinner.css";

declare const __WKSPINNER_BUNDLED_DEBUG__: boolean;

const MODULE_BASE_PAGE = "利用者:鈴音雨/WKSpinner/modules/";
const PAGE_BASE = "利用者:鈴音雨/WKSpinner/pages/";

type ModuleExports = { init: () => void | Promise<void> };

/** Portlet menu descriptors for modules that expose a menu link. */
const PORTLET_MODULES: Record<
  string,
  { id: string; label: string; description: string }
> = {
  csd: {
    id: "wks-csd",
    label: "即時削除",
    description: "即時削除テンプレートを貼り付ける",
  },
  mi: {
    id: "wks-mi",
    label: "問題",
    description: "問題テンプレートを貼り付ける",
  },
  rfp: {
    id: "wks-rfp",
    label: "保護(解)依頼",
    description: "保護・保護解除を依頼する",
  },
  skj: { id: "wks-skj", label: "削除依頼", description: "削除依頼をする" },
  warn: {
    id: "wks-warn",
    label: "通知",
    description: "ユーザーへ通知・警告を行う",
  },
};

const moduleCache = new Map<string, ModuleExports>();

function loadFrom(
  base: string,
  hookNs: string,
  name: string,
): Promise<ModuleExports> {
  const cacheKey = `${hookNs}.${name}`;
  const cached = moduleCache.get(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }
  const ready = new Promise<ModuleExports>((resolve) => {
    mw.hook(`wkspinner.${hookNs}.${name}`).add((exports: ModuleExports) => {
      moduleCache.set(cacheKey, exports);
      resolve(exports);
    });
  });
  if (!__WKSPINNER_BUNDLED_DEBUG__) {
    mw.loader.load(
      mw.config.get("wgServer") +
        mw.config.get("wgScript") +
        "?action=raw&ctype=text/javascript&title=" +
        mw.util.wikiUrlencode(base + name + ".js"),
      "text/javascript",
    );
  }
  return ready;
}

function loadModule(name: string): Promise<ModuleExports> {
  return loadFrom(MODULE_BASE_PAGE, "module", name);
}

function loadPage(name: string): Promise<ModuleExports> {
  return loadFrom(PAGE_BASE, "page", name);
}

async function runModule(name: string): Promise<void> {
  const { init } = await loadModule(name);
  await init();
}

async function runPage(name: string): Promise<void> {
  const { init } = await loadPage(name);
  await init();
}

/**
 * Place the portlet link for a module synchronously, then eagerly load the
 * module bundle in the background. A placeholder click handler is installed
 * to swallow clicks until the module's init replaces it via `takePortlet`.
 */
function setupPortletModule(name: string): void {
  const desc = PORTLET_MODULES[name];
  if (!desc) {
    return;
  }
  const portlet = createPortletLink(desc.label, desc.id, desc.description);
  if (!portlet) {
    console.warn(`${SCRIPT_NAME}: メニューの作成に失敗しました。(${name})`);
    return;
  }
  // Swallow click until the module's init attaches the real handler.
  portlet.addEventListener("click", (e) => e.preventDefault());
  void runModule(name);
}

if (__WKSPINNER_BUNDLED_DEBUG__) {
  mw.loader.addStyleTag(BUNDLED_STYLE);
} else {
  mw.loader.load(
    mw.config.get("wgServer") +
      mw.config.get("wgScript") +
      "?action=raw&ctype=text/css&title=" +
      mw.util.wikiUrlencode("利用者:鈴音雨/WKSpinner.css"),
    "text/css",
  );
}

async function init() {
  const groups = mw.config.get("wgUserGroups", []);
  const namespaceNumber = mw.config.get("wgNamespaceNumber");

  if (groups && !groups.includes("autoconfirmed")) {
    mw.notify(`${SCRIPT_NAME}: 自動承認されたユーザーのみが使用できます。`);
  }

  const isMobile = mw.config.get("skin") === "minerva";
  const isWatchlistUsersPage =
    mw.config.get("wgAction") === "view" &&
    mw.config.get("wgPageName") === WATCHLIST_USERS_PAGE_NAME;

  if (getOptionProperty("prefLinkInToolbar")) {
    const el = mw.util.addPortletLink(
      isMobile ? "pt-preferences" : "p-tb",
      `/wiki/${CONFIG_PAGE_NAME}`,
      `${SCRIPT_NAME}の設定`,
      "pt-wks-pref",
    );
    if (isMobile && el) {
      $("#pt-wks-pref")
        .find(".minerva-icon")
        .addClass("minerva-icon--settings");
    }
  }

  await loadLibrary();

  if (
    mw.config.get("wgAction") === "view" &&
    mw.config.get("wgPageName") === CONFIG_PAGE_NAME
  ) {
    await runPage("preferences");
  }

  if (
    mw.config.get("wgAction") === "view" &&
    mw.config.get("wgPageName") === DEBUG_PAGE_NAME
  ) {
    await runPage("debug");
  }

  if (isWatchlistUsersPage) {
    await runPage("watchlistUsers");
  }

  // モバイル無効設定
  if (getOptionProperty("disableMobile") === true && isMobile) {
    return;
  }

  // 特別ページ
  if (Math.sign(namespaceNumber) === -1) {
    if (getOptionProperty("editCount.enabled") === true) {
      if (!(
        isMobile && getOptionProperty("editCount.enableMobile") === false
      )) {
        if (
          mw.config.get("wgCanonicalSpecialPageName") === "Recentchanges" ||
          mw.config.get("wgCanonicalSpecialPageName") === "Watchlist" ||
          mw.config.get("wgCanonicalSpecialPageName") === "Newpages"
        ) {
          await runModule("editCount");
        }
      }
    }
    return;
  }
  if (mw.config.get("wgAction") === "history" || isWatchlistUsersPage) {
    if (
      getOptionProperty("editCount.enabled") === true &&
      !(isMobile && getOptionProperty("editCount.enableMobile") === false)
    ) {
      await runModule("editCount");
      if (isWatchlistUsersPage) {
        mw.hook("wikipage.content").fire($(".wks-watchlist-users-results"));
      }
    }
  }

  if (
    !isMobile &&
    mw.config.get("wgAction") === "view" &&
    !isWatchlistUsersPage &&
    getOptionProperty("wikidata.enabled") === true
  ) {
    await runModule("wikidata");
  }

  if (getOptionProperty("useIndividualPortlet") === true && !isMobile) {
    mw.util.addPortlet(ORIG_PORTLET_ID, PORTLET_LABEL, "#p-cactions");
  }

  await migrate();
  versionNotify();

  // 即時削除
  if (
    getOptionProperty("csd.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("csd.enableMobile") === false)
  ) {
    setupPortletModule("csd");
  }

  // 即時版指定削除
  if (
    getOptionProperty("csrd.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("csrd.enableMobile") === false) &&
    mw.config.get("wgAction") === "history"
  ) {
    await runModule("csrd");
  }

  // 問題
  if (
    getOptionProperty("mi.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("mi.enableMobile") === false) &&
    (namespaceNumber === 0 || namespaceNumber === 2) // メインまたはユーザー
  ) {
    setupPortletModule("mi");
  }

  // 削除依頼
  if (
    getOptionProperty("skj.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("skj.enableMobile") === false)
  ) {
    setupPortletModule("skj");
  }

  // ユーザーへの警告
  if (
    getOptionProperty("warn.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("warn.enableMobile") === false) &&
    (namespaceNumber === 2 || namespaceNumber === 3)
  ) {
    setupPortletModule("warn");
  }

  // 保護依頼
  if (
    getOptionProperty("rfp.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("rfp.enableMobile") === false)
  ) {
    setupPortletModule("rfp");
  }
}

async function migrate() {
  const lastVersion = mw.user.options.get(VERSION_OPTIONS_KEY) || "0.0.0";
  const settings = getSavedOptions();
  if (applyOptionMigrations(settings, lastVersion)) {
    const serializedSettings = JSON.stringify(settings);
    await new mw.Api().postWithEditToken({
      action: "options",
      format: "json",
      optionname: OPTIONS_KEY,
      optionvalue: serializedSettings,
      formatversion: "2",
    });
    mw.user.options.set(OPTIONS_KEY, serializedSettings);
  }
}

async function versionNotify() {
  const currentVersion = VERSION;
  const lastVersion = mw.user.options.get(VERSION_OPTIONS_KEY) || "0.0.0";

  if (cmp(currentVersion, lastVersion) === 1) {
    await new mw.Api().saveOption(VERSION_OPTIONS_KEY, currentVersion);

    const setting = getOptionProperty("versionNotify");
    const notify = () =>
      mw.notify(
        $(
          `<span>${SCRIPT_NAME}: 新しいバージョン ${currentVersion} にアップデートされました。詳細は<a href="${RELEASE_NOTES}" target="_blank">リリースノート</a>を参照。</span>`,
        ),
      );

    if (setting === "all") {
      notify();
    } else if (setting === "minor") {
      const current = currentVersion.split(".");
      const last = lastVersion.split(".");
      if (current[0] !== last[0] || current[1] !== last[1]) {
        notify();
      }
    }
  }
}

mw.loader
  .using("jquery.ui")
  .then(() => init())
  .catch((e) => {
    console.error(e);
  });
