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
} from "./constants";
import { showDebugPage } from "./debug";
import { initCsd } from "./modules/csd";
import { initCsrd } from "./modules/csrd";
import { initEditCount } from "./modules/editCount";
import { initMi } from "./modules/mi";
import { initRFP } from "./modules/rfp";
import { initSkj } from "./modules/skj";
import { initWarn } from "./modules/warn";
import { showConfigPage } from "./preferences";
import { getOptionProperty, getSavedOptions, loadLibrary } from "./util";
import cmp from "semver-compare";

mw.loader.load(
  mw.config.get("wgServer") +
    mw.config.get("wgScript") +
    "?action=raw&ctype=text/css&title=" +
    mw.util.wikiUrlencode("利用者:鈴音雨/WKSpinner.css"),
  "text/css",
);

async function init() {
  const groups = mw.config.get("wgUserGroups", []);
  const namespaceNumber = mw.config.get("wgNamespaceNumber");

  if (groups && !groups.includes("autoconfirmed")) {
    mw.notify(`${SCRIPT_NAME}: 自動承認されたユーザーのみが使用できます。`);
  }

  const isMobile = mw.config.get("skin") === "minerva";

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
    await showConfigPage();
  }

  if (
    mw.config.get("wgAction") === "view" &&
    mw.config.get("wgPageName") === DEBUG_PAGE_NAME
  ) {
    await showDebugPage();
  }

  // モバイル無効設定
  if (getOptionProperty("disableMobile") === true && isMobile) {
    return;
  }

  // 特別ページ
  if (Math.sign(namespaceNumber) === -1) {
    if (getOptionProperty("editCount.enabled") === true) {
      if (
        !(isMobile && getOptionProperty("editCount.enableMobile") === false)
      ) {
        if (
          mw.config.get("wgCanonicalSpecialPageName") === "Recentchanges" ||
          mw.config.get("wgCanonicalSpecialPageName") === "Watchlist" ||
          mw.config.get("wgCanonicalSpecialPageName") === "Newpages"
        ) {
          initEditCount();
        }
      }
    }
    return;
  }
  if (mw.config.get("wgAction") === "history") {
    if (
      getOptionProperty("editCount.enabled") === true &&
      !(isMobile && getOptionProperty("editCount.enableMobile") === false)
    ) {
      initEditCount();
    }
  }

  if (getOptionProperty("useIndividualPortlet") === true && !isMobile) {
    mw.util.addPortlet(ORIG_PORTLET_ID, PORTLET_LABEL, "#p-search");
  }

  await migrate();
  versionNotify();

  // 即時削除
  if (
    getOptionProperty("csd.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("csd.enableMobile") === false)
  ) {
    await initCsd();
  }

  // 即時版指定削除
  if (
    getOptionProperty("csrd.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("csrd.enableMobile") === false) &&
    mw.config.get("wgAction") === "history"
  ) {
    await initCsrd();
  }

  // 問題
  if (
    getOptionProperty("mi.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("mi.enableMobile") === false) &&
    (namespaceNumber === 0 || namespaceNumber === 2) // メインまたはユーザー
  ) {
    await initMi();
  }

  // 削除依頼
  if (
    getOptionProperty("skj.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("skj.enableMobile") === false)
  ) {
    await initSkj();
  }

  // ユーザーへの警告
  if (
    getOptionProperty("warn.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("warn.enableMobile") === false) &&
    (namespaceNumber === 2 || namespaceNumber === 3)
  ) {
    await initWarn();
  }

  // 保護依頼
  if (
    getOptionProperty("rfp.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("rfp.enableMobile") === false)
  ) {
    await initRFP();
  }
}

async function migrate() {
  const lastVersion = mw.user.options.get(VERSION_OPTIONS_KEY) || "0.0.0";
  // 0.10.6未満のバージョンからのアップデート
  if (cmp(lastVersion, "0.10.6") === -1) {
    const settings = getSavedOptions();
    if (settings?.rfp?.default?.summarySubmit === "保護依頼") {
      settings.rfp.default.summarySubmit = "+$p";
      await new mw.Api()
        .postWithEditToken({
          action: "options",
          format: "json",
          optionname: OPTIONS_KEY,
          optionvalue: JSON.stringify(settings),
          formatversion: "2",
        })
    }
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

init();
