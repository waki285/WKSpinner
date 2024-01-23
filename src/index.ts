import { CONFIG_PAGE_NAME, SCRIPT_NAME } from "./constants";
import { initCsd } from "./modules/csd";
import { initEditCount } from "./modules/editCount";
import { initMi } from "./modules/mi";
import { initSkj } from "./modules/skj";
import { showConfigPage } from "./preferences";
import { getOptionProperty, loadLibrary } from "./util";

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
      $("#pt-wks-pref").find(".minerva-icon").addClass("minerva-icon--settings");
    }
  }

  // 特別ページ
  if (Math.sign(namespaceNumber) === -1) {
    if (getOptionProperty("editCount.enabled") === true) {
      if (
        !(isMobile && getOptionProperty("editCount.enableMobile") === false)
      ) {
        if (mw.config.get("wgCanonicalSpecialPageName") === "Recentchanges" || mw.config.get("wgCanonicalSpecialPageName") === "Watchlist" || mw.config.get("wgCanonicalSpecialPageName") === "Newpages") {
          initEditCount();
        }
      }
    }
    return;
  }

  await loadLibrary();

  if (
    mw.config.get("wgAction") === "view" &&
    mw.config.get("wgPageName") === CONFIG_PAGE_NAME
  ) {
    await showConfigPage();
  }

  // モバイル無効設定
  if (getOptionProperty("disableMobile") === true && isMobile) {
    return;
  }

  // 即時削除
  if (
    getOptionProperty("csd.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("csd.enableMobile") === false)
  ) {
    await initCsd();
  }

  // 問題
  if (
    getOptionProperty("mi.enabled") === true && // 無効でない
    !(isMobile && getOptionProperty("mi.enableMobile") === false)
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
}

init();
