import { getOptionProperty } from "@/util";
import { openDialog as openCodexDialog } from "./codex";
import { openDialog as openJqueryUiDialog } from "./jquery-ui";
import type { DialogConfig, DialogController } from "./types";

export type {
  DialogButton,
  DialogButtonVariant,
  DialogConfig,
  DialogController,
} from "./types";

export async function openDialog(
  config: DialogConfig,
): Promise<DialogController> {
  if (getOptionProperty("useCodexModal") === true) {
    try {
      return await openCodexDialog(config);
    } catch (error) {
      console.warn(
        "WKSpinner: Codex モーダルの初期化に失敗しました。jQuery UI にフォールバックします。",
        error,
      );
    }
  }
  return openJqueryUiDialog(config);
}
