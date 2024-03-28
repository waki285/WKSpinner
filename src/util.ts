import {
  DEFAULT_OPTIONS,
  ISSUE_TEMPLATE_AREA,
  MI_CHOICES,
  OPTIONS_KEY,
  ORIG_PORTLET_ID,
  SCRIPT_NAME,
  TIMEZONE_VALUES,
} from "./constants";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let lib: any;

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
    theme === "minerva"
      ? "p-tb"
      : getOptionProperty("useIndividualPortlet") === true
        ? ORIG_PORTLET_ID
        : "p-cactions",
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
  const properties = propertyPath.split(".");
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

const issueTemplateMaps: ReadonlyMap<
  string,
  (typeof MI_CHOICES)[number]["id"]
> = new Map(
  // @ts-expect-error 検証済み
  MI_CHOICES.flatMap((choice) => [
    [choice.name.toLowerCase(), choice.id],
    ...("aliases" in choice
      ? choice.aliases?.map((alias) => [alias, choice.id]) ?? []
      : []),
  ]),
);

type IssueTemplateType = (typeof MI_CHOICES)[number]["id"];
type IssueTemplate = { name: IssueTemplateType; date: string; [key: string]: string };

export function extractIssueTemplates(
  inputString: string,
): IssueTemplate[] {
  const pattern = /\{\{([^}]+)\}\}/g;
  let match;
  const output: IssueTemplate[] = [];

  while ((match = pattern.exec(inputString)) !== null) {
    const parts = match[1]!.split("|").map((part) => part.trim());
    const namePart = parts[0]!.toLowerCase().replaceAll("_", " ");
    let templateObj = {} as IssueTemplate;

    if (
      ["multiple", "複数の問題", "multiple issues", "article issues"].includes(
        namePart,
      )
    ) {
      const hasSection = parts.some((part) => part.replaceAll(" ", "").startsWith("section="));
      if (!hasSection) {
        parts.slice(1).forEach((part) => {
          const [paramName, paramValue] = part.split("=").map((p) => p.trim());
          if (issueTemplateMaps.has(paramName!.toLowerCase())) {
            templateObj = {
              name: issueTemplateMaps.get(paramName!.toLowerCase()) as IssueTemplateType,
              date: paramValue!,
            };
            output.push(templateObj);
          } else {
            templateObj[paramName!] = paramValue!;
          }
        });
      }
    } else {
      const hasSection = parts.some((part) => part.replaceAll(" ", "").startsWith("section="));
      if (!hasSection && issueTemplateMaps.has(namePart.toLowerCase())) {
        templateObj = {
          name: issueTemplateMaps.get(namePart.toLowerCase())!,
          date: "",
        };
        const datePart = parts.find((part) =>
          part.replaceAll(" ", "").startsWith("date="),
        );
        if (datePart) {
          templateObj.date = datePart.split("=")[1]!.trim();
        }
        parts.slice(1).forEach((part) => {
          const [paramName, paramValue] = part.split("=").map((p) => p.trim());
          if (!issueTemplateMaps.has(paramName!.toLowerCase())) {
            templateObj[paramName!] = paramValue!;
          }
        });
        output.push(templateObj);
      }
    }
  }
  console.log(output);
  return output;
}

export function replaceFirstAndRemoveOtherIssueTemplates(
  inputString: string,
): string {
  const pattern = /\{\{([^}]+)\}\}/g;
  let match;
  let outputString = inputString;
  let replaced = false;

  while ((match = pattern.exec(inputString)) !== null) {
    const block = match[0];
    const parts = match[1]!.split("|").map((part) => part.trim());
    const namePart = parts[0]!.toLowerCase();

    if (
      ["multiple", "複数の問題", "multiple issues", "article issues"].includes(
        namePart,
      )
    ) {
      const hasSection = parts.some((part) => part.replaceAll(" ", "").startsWith("section="));
      if (!hasSection) {
        if (!replaced) {
          outputString = outputString.replace(
            block,
            ISSUE_TEMPLATE_AREA
          );
          replaced = true;
        } else {
          outputString = outputString.replace(block, "");
        }
      }
    } else if (
      [...issueTemplateMaps.keys()]
        .map((value) => value.toLowerCase())
        .includes(namePart)
    ) {
      const hasSection = parts.some((part) => part.replaceAll(" ", "").startsWith("section="));
      if (!hasSection) {
        if (!replaced) {
          outputString = outputString.replace(
            block,
            ISSUE_TEMPLATE_AREA
          );
          replaced = true;
        } else {
          outputString = outputString.replace(block, "");
        }
      }
    }
  }

  if (!replaced) {
    outputString = ISSUE_TEMPLATE_AREA + outputString;
  }

  return outputString;
}

export function formatDate(year: number, month: number, day: number, hour: number, minute: number, timezone: string) {
  const timezoneValue = TIMEZONE_VALUES.get(timezone);
  if (timezoneValue === undefined) {
    throw new Error("Invalid timezone");
  }
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const date = new Date(Date.UTC(year, month - 1, day, hour - timezoneValue, minute));
  const yearStr = date.getUTCFullYear();
  const monthStr = (date.getUTCMonth() + 1);
  const dayStr = date.getUTCDate();
  const weekdayStr = weekdays[date.getUTCDay()];
  const hourStr = ('0' + date.getUTCHours()).slice(-2);
  const minuteStr = ('0' + date.getUTCMinutes()).slice(-2);
  return `${yearStr}年${monthStr}月${dayStr}日 (${weekdayStr}) ${hourStr}:${minuteStr}`;
}

export function pageNameToNamespace(pageName: string) {
  const namespace = pageName.split(":")[0] || "";
  const namespaceNumber = mw.config.get("wgNamespaceIds")[namespace.toLowerCase()];
  return namespaceNumber;
}