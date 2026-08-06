import type { DialogButton, DialogConfig, DialogController } from "./types";

export async function openDialog(
  config: DialogConfig,
): Promise<DialogController> {
  const root = $("<div>");
  if (config.height) {
    root.css("height", config.height);
  }
  if (config.width) {
    root.css("width", config.width);
  } else {
    root.css("width", "auto");
  }
  root.css("max-height", "70vh");
  root.append(config.content);

  root.dialog({
    dialogClass: config.dialogClass ?? "",
    title: config.title,
    resizable: false,
    height: "auto",
    width: config.width ?? "auto",
    modal: true,
    close: () => {
      root.empty();
      try {
        root.dialog("destroy");
      } catch {
        // already destroyed
      }
      config.onClose?.();
    },
  });

  const renderButtons = (buttons: DialogButton[]) => {
    root.dialog({
      buttons: buttons.map((b) => ({
        text: b.label,
        click: () => {
          void b.onClick();
        },
      })),
    });
  };

  if (config.buttons) {
    renderButtons(config.buttons);
  }

  return {
    setButtons: renderButtons,
    reposition: () => {
      root.dialog({
        position: {
          my: "top",
          at: "top+5%",
          of: window,
        },
      });
    },
    close: () => {
      root.dialog("close");
    },
  };
}
