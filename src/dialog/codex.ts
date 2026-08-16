import type { DialogButton, DialogConfig, DialogController } from "./types";

const CODEX_MODULES = ["vue", "@wikimedia/codex"] as const;

type VueModule = {
  createApp: (root: unknown, props?: Record<string, unknown>) => VueApp;
  h: (
    type: unknown,
    props?: Record<string, unknown> | null,
    children?: unknown,
  ) => unknown;
  ref: <T>(value: T) => { value: T };
  onMounted: (fn: () => void) => void;
  nextTick: (fn?: () => void) => Promise<void>;
};

type VueApp = {
  mount: (target: HTMLElement) => unknown;
  unmount: () => void;
};

type CodexModule = {
  CdxDialog: unknown;
  CdxButton: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequireFn = (name: string) => any;
const requireKey = Symbol.for("wkspinner.codex.require");

function waitForCodex(): Promise<RequireFn> {
  return new Promise((resolve, reject) => {
    mw.loader.using(
      [...CODEX_MODULES],
      (require: RequireFn) => {
        (globalThis as Record<symbol, unknown>)[requireKey] = require;
        resolve(require);
      },
      reject,
    );
  });
}

async function getRequire(): Promise<RequireFn> {
  const cached = (globalThis as Record<symbol, unknown>)[requireKey] as
    RequireFn | undefined;
  if (cached) {
    return cached;
  }
  return waitForCodex();
}

function actionFor(variant: DialogButton["variant"] | undefined) {
  switch (variant) {
    case "progressive":
      return "progressive";
    case "destructive":
      return "destructive";
    default:
      return "default";
  }
}

function weightFor(variant: DialogButton["variant"] | undefined) {
  return variant === "normal" || variant === undefined ? "normal" : "primary";
}

export async function openDialog(
  config: DialogConfig,
): Promise<DialogController> {
  const requireModule = await getRequire();

  const Vue = requireModule("vue") as VueModule;
  const Codex = requireModule("@wikimedia/codex") as CodexModule;
  const { CdxDialog, CdxButton } = Codex;

  const host = document.createElement("div");
  document.body.append(host);
  host.classList.add("wks-codex-dialog-host");

  const buttonsRef = Vue.ref<DialogButton[]>(config.buttons ?? []);
  let closed = false;

  const cleanup = () => {
    if (closed) return;
    closed = true;
    config.onClose?.();
    app.unmount();
    host.remove();
  };

  const app = Vue.createApp({
    setup() {
      const bodyRef = Vue.ref<HTMLElement | null>(null);
      const isOpen = Vue.ref(true);

      Vue.onMounted(async () => {
        await Vue.nextTick();
        const bodyEl = bodyRef.value;
        const contentEl = config.content[0];
        if (bodyEl && contentEl) {
          bodyEl.append(contentEl);
        }
      });

      return () =>
        Vue.h(
          CdxDialog,
          {
            open: isOpen.value,
            "onUpdate:open": (v: boolean) => {
              if (!v) {
                cleanup();
              }
            },
            title: config.title,
            useCloseButton: true,
            onClose: () => cleanup(),
            class: config.dialogClass ?? "",
            style: {
              maxWidth: "calc(100vw - 2rem)",
              width: config.width ?? "auto",
            },
          },
          {
            default: () =>
              Vue.h("div", {
                ref: bodyRef,
                class: "wks-codex-dialog-body",
                style: "max-height: 70vh; overflow-y: auto;",
              }),
            footer: () =>
              buttonsRef.value.length === 0
                ? undefined
                : Vue.h(
                    "div",
                    {
                      class: "cdx-dialog__footer__actions",
                      style:
                        "display:flex; gap:0.5rem; justify-content:flex-end;",
                    },
                    buttonsRef.value.map((b) =>
                      Vue.h(
                        CdxButton,
                        {
                          action: actionFor(b.variant),
                          weight: weightFor(b.variant),
                          onClick: () => {
                            void b.onClick();
                          },
                        },
                        () => b.label,
                      ),
                    ),
                  ),
          },
        );
    },
  });

  app.mount(host);

  return {
    setButtons: (next: DialogButton[]) => {
      buttonsRef.value = next;
    },
    reposition: () => {
      // Codex dialog is centered via CSS overlay; reposition is a no-op.
    },
    close: () => {
      cleanup();
    },
  };
}
