import { VERSION } from "./constants";
import { getSavedOptions } from "./util";

export async function showDebugPage() {
  const debugArea = $("#wkspinner-debug-area");
  debugArea.empty();
  const pre = $("<pre>");
  const settings = getSavedOptions();
  pre.text(JSON.stringify(settings));
  debugArea.append(pre);
  const pre2 = $("<pre>");
  pre2.text(`Version: ${VERSION}\nSkin: ${mw.config.get("skin")}`);
  debugArea.append(pre2);
}