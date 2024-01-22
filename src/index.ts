import { CONFIG_PAGE_NAME, SCRIPT_NAME } from "./constants";
import { initCsd } from "./modules/csd";
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

  // 特別ページ
  if (Math.sign(namespaceNumber) === -1) {
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
  const isMobile = mw.config.get("skin") === "minerva";
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
