import { DEFAULT_OPTIONS, OPTIONS_KEY, ORIG_PORTLET_ID, SCRIPT_NAME } from "./constants";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let lib: any;

/**
 * Get an \<img> tag.
 * @param iconType
 * @param cssText Additional styles to apply (Default styles: `vertical-align: middle; height: 1em; border: 0;`)
 * @returns
 */
export function getImage(iconType: string, cssText: string) {
  if (cssText === void 0) {
    cssText = "";
  }
  const img = (function () {
    if (
      iconType === "load" ||
      iconType === "check" ||
      iconType === "cross" ||
      iconType === "cancel"
    ) {
      return lib.getIcon(iconType);
    } else {
      const tag = document.createElement("img");
      switch (iconType) {
        case "gear":
          tag.src =
            "https://upload.wikimedia.org/wikipedia/commons/0/05/OOjs_UI_icon_advanced.svg";
          break;
        case "exclamation":
          tag.src =
            "https://upload.wikimedia.org/wikipedia/commons/c/c6/OOjs_UI_icon_alert-warning-black.svg";
          break;
        case "bar":
          tag.src =
            "https://upload.wikimedia.org/wikipedia/commons/e/e5/OOjs_UI_icon_subtract.svg";
          break;
        case "clock":
          tag.src =
            "https://upload.wikimedia.org/wikipedia/commons/8/85/OOjs_UI_icon_clock-progressive.svg";
      }
      tag.style.cssText = "vertical-align: middle; height: 1em; border: 0;";
      return tag;
    }
  })();
  img.style.cssText += cssText;
  return img;
}

/**
 * Load the library.
 * @param dev Whether to load the dev version of the library.
 * @returns
 */
export async function loadLibrary(dev?: boolean) {
  if (dev === void 0) {
    dev = false;
  }
  const libName = "ext.gadget.WpLibExtra" + (dev ? "Dev" : "");
  const loadLocal = async function () {
    return mw.loader
      .using(libName)
      .then(function (require) {
        lib = require(libName);
        if (typeof (lib && lib.version) !== "string") {
          console.error("Failed to load library");
          return false;
        }
        return true;
      })
      .catch(function () {
        const err = [];
        for (let _i = 0; _i < arguments.length; _i++) {
          // eslint-disable-next-line prefer-rest-params
          err[_i] = arguments[_i];
        }
        console.error(err);
        return false;
      });
  };
  if (dev) {
    return mw.loader
      .getScript("https://test.wikipedia.org/w/load.php?modules=" + libName)
      .then(loadLocal)
      .catch(function () {
        const err = [];
        for (let _i = 0; _i < arguments.length; _i++) {
          // eslint-disable-next-line prefer-rest-params
          err[_i] = arguments[_i];
        }
        console.error(err);
        return false;
      });
  } else {
    return loadLocal();
  }
}

/**
 * メニューリンクを作成
 */
export function createPortletLink(
  title: string,
  id: string,
  description: string,
): HTMLLIElement | null {
  const theme = mw.config.get("skin");
  const portlet = mw.util.addPortletLink(
    theme === "minerva" ? "p-tb" :
    getOptionProperty("useIndividualPortlet") === true ? ORIG_PORTLET_ID:"p-cactions",
    "#",
    title,
    id,
    description,
  );
  return portlet || null;
}

export function createRowFunc(content: string) {
  return (id: string) => {
    const row = $("<div>");
    row.prop("id", `wks-${content}-dialog-${id}`);
    return row;
  };
}

export function getSavedOptions() {
  try {
    const options = JSON.parse(
      (mw.user?.options?.get(OPTIONS_KEY) as unknown as string | undefined) ||
        JSON.stringify(DEFAULT_OPTIONS),
    );
    return options;
  } catch {
    console.warn(
      `${SCRIPT_NAME}: 保存されているオプションの値が不正です。デフォルトにフォールバックします。`,
    );
    return DEFAULT_OPTIONS;
  }
}
/*
export function getOptionProperty(option: string) {
  // option example: "mi.default.summary"
  const options = getSavedOptions();
  const optionParts = option.split(".");
  let current = options;
  // if option is undefined, return default option prop
  let steps = optionParts.length;
  for (const part of optionParts) {
    console.log("a: ", part);
    console.log("b: ", current[part]);
    if (current[part] === undefined) {
      current = DEFAULT_OPTIONS;
      console.log("c: ", current);
      for (let i = 0; i < optionParts.length - steps; i++) {
        console.log("d: ", optionParts[i]);
        current = current[optionParts[i] as string];
      }
    }
    console.log("e: ", current);
    current = current[part];
    steps++;
  }
  return current;
}*/
export function getOptionProperty(propertyPath: string) {
  const properties = propertyPath.split('.');
  let currentObject = getSavedOptions();

  for (const prop of properties) {
      if (prop in currentObject) {
          currentObject = currentObject[prop];
      } else {
          currentObject = DEFAULT_OPTIONS;
          for (const defaultProp of properties) {
              if (defaultProp in currentObject) {
                  currentObject = currentObject[defaultProp];
              } else {
                  return undefined;
              }
          }
          return currentObject;
      }
  }
  return currentObject;
}

export function errorMessage(message: string) {
  return mw.notify(`${SCRIPT_NAME}: ${message}`, { type: "error" });
}
