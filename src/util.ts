import {
  ALL_ISSUE_CHOICES,
  DEFAULT_OPTIONS,
  HATNOTE_TEMPLATES,
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

function normalizeTemplateName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^(?:template|テンプレート)\s*:/, "");
}

const issueTemplateMaps: ReadonlyMap<
  string,
  (typeof ALL_ISSUE_CHOICES)[number]["id"]
> = new Map(
  // @ts-expect-error 検証済み
  ALL_ISSUE_CHOICES.flatMap((choice) => [
    [normalizeTemplateName(choice.name), choice.id],
    ...("aliases" in choice
      ? (choice.aliases?.map((alias) => [
          normalizeTemplateName(alias),
          choice.id,
        ]) ?? [])
      : []),
  ]),
);

const multipleIssueTemplateMaps: ReadonlyMap<
  string,
  (typeof MI_CHOICES)[number]["id"]
> = new Map(
  // @ts-expect-error 検証済み
  MI_CHOICES.flatMap((choice) => [
    [normalizeTemplateName(choice.name), choice.id],
    ...("aliases" in choice
      ? (choice.aliases?.map((alias) => [
          normalizeTemplateName(alias),
          choice.id,
        ]) ?? [])
      : []),
  ]),
);

type IssueTemplateType = (typeof ALL_ISSUE_CHOICES)[number]["id"];
export type IssueTemplate = {
  name: IssueTemplateType;
  date: string;
  dubious?: string;
  [key: string]: string;
};

const hatnoteTemplateNames = new Set(
  HATNOTE_TEMPLATES.flatMap(({ name, aliases }) => [name, ...aliases]).map(
    normalizeTemplateName,
  ),
);

type TemplateBlock = {
  name: string;
  end: number;
};

function findTopLevelTemplateBlocks(inputString: string): TemplateBlock[] {
  const blocks: TemplateBlock[] = [];

  for (let start = 0; start < inputString.length - 1; start++) {
    if (inputString.slice(start, start + 2) !== "{{") {
      continue;
    }

    let depth = 1;
    let cursor = start + 2;
    let nameEnd: number | undefined;

    while (cursor < inputString.length - 1 && depth > 0) {
      const pair = inputString.slice(cursor, cursor + 2);
      if (pair === "{{") {
        depth++;
        cursor += 2;
      } else if (pair === "}}") {
        depth--;
        cursor += 2;
      } else {
        if (
          depth === 1 &&
          nameEnd === undefined &&
          inputString[cursor] === "|"
        ) {
          nameEnd = cursor;
        }
        cursor++;
      }
    }

    if (depth !== 0) {
      break;
    }

    blocks.push({
      name: inputString.slice(start + 2, nameEnd ?? cursor - 2),
      end: cursor,
    });
    start = cursor - 1;
  }

  return blocks;
}

function insertIssueTemplateAreaAfterHatnotes(
  inputString: string,
): string | null {
  const lastHatnote = findTopLevelTemplateBlocks(inputString)
    .filter(({ name }) => hatnoteTemplateNames.has(normalizeTemplateName(name)))
    .at(-1);

  if (!lastHatnote) {
    return null;
  }

  const trailingLineBreak = inputString
    .slice(lastHatnote.end)
    .match(/^[\t ]*(?:\r\n|\n|\r)/)?.[0];
  const separator = trailingLineBreak ?? "\n";
  const suffixStart = lastHatnote.end + (trailingLineBreak?.length ?? 0);

  return (
    inputString.slice(0, lastHatnote.end) +
    separator +
    ISSUE_TEMPLATE_AREA +
    inputString.slice(suffixStart)
  );
}

export function extractIssueTemplates(inputString: string): IssueTemplate[] {
  const pattern = /\{\{([^}]+)\}\}/g;
  let match;
  const output: IssueTemplate[] = [];

  while ((match = pattern.exec(inputString)) !== null) {
    const parts = match[1]!.split("|").map((part) => part.trim());
    const namePart = normalizeTemplateName(parts[0]!);
    let templateObj = {} as IssueTemplate;

    if (
      ["multiple", "複数の問題", "multiple issues", "article issues"].includes(
        namePart,
      )
    ) {
      const hasSection = parts.some((part) =>
        part.replaceAll(" ", "").startsWith("section="),
      );
      if (!hasSection) {
        parts.slice(1).forEach((part) => {
          const [paramName, paramValue] = part.split("=").map((p) => p.trim());
          const normalizedParamName = normalizeTemplateName(paramName!);
          if (multipleIssueTemplateMaps.has(normalizedParamName)) {
            templateObj = {
              name: multipleIssueTemplateMaps.get(
                normalizedParamName,
              ) as IssueTemplateType,
              date: paramValue!,
            };
            output.push(templateObj);
          } else {
            templateObj[paramName!] = paramValue!;
          }
        });
      }
    } else {
      const hasSection = parts.some((part) =>
        part.replaceAll(" ", "").startsWith("section="),
      );
      if (!hasSection && issueTemplateMaps.has(namePart.toLowerCase())) {
        if (
          namePart === "信頼性" ||
          namePart === "精度" ||
          namePart.toLowerCase() === "disputed" ||
          namePart === "正確性"
        ) {
          const otherParams = parts
            .slice(1)
            .filter(
              (part) =>
                !part.replaceAll(" ", "").startsWith("date=") &&
                !part.replaceAll(" ", "").startsWith("ソートキー="),
            );
          if (otherParams.length > 0) {
            output.push({
              name: issueTemplateMaps.get(namePart.toLowerCase())!,
              date: "",
              dubious: "true",
            });
            continue;
          }
        }
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
        let positionalIndex = 0;
        parts.slice(1).forEach((part) => {
          const separatorIndex = part.indexOf("=");
          if (separatorIndex === -1) {
            positionalIndex++;
            templateObj[String(positionalIndex)] = part;
            return;
          }

          const paramName = part.slice(0, separatorIndex).trim();
          const paramValue = part.slice(separatorIndex + 1).trim();
          if (
            paramName.toLowerCase() !== "date" &&
            paramName.toLowerCase() !== "section" &&
            paramName !== "節"
          ) {
            templateObj[paramName] = paramValue;
          }
        });
        output.push(templateObj);
      }
    }
  }
  return output;
}

export function replaceFirstAndRemoveOtherIssueTemplates(
  inputString: string,
): string {
  const pattern = /\{\{([^}]+)\}\}/g;
  let match;
  let outputString = inputString;
  let replaced = false;

  const replaceTemplate = (block: string) => {
    const blockIndex = outputString.indexOf(block);
    if (blockIndex === -1) {
      return;
    }

    let replacementStart = blockIndex;
    if (replaced) {
      const areaIndex = outputString.indexOf(ISSUE_TEMPLATE_AREA);
      const areaEnd = areaIndex + ISSUE_TEMPLATE_AREA.length;
      if (
        areaIndex !== -1 &&
        /^\s*$/.test(outputString.slice(areaEnd, blockIndex))
      ) {
        replacementStart = areaEnd;
      }
    }

    const blockEnd = blockIndex + block.length;
    const trailingLineBreak = outputString
      .slice(blockEnd)
      .match(/^[\t ]*\r?\n/);
    const replacementEnd = blockEnd + (trailingLineBreak?.[0].length ?? 0);

    outputString =
      outputString.slice(0, replacementStart) +
      (replaced ? "" : ISSUE_TEMPLATE_AREA) +
      outputString.slice(replacementEnd);
    replaced = true;
  };

  while ((match = pattern.exec(inputString)) !== null) {
    const block = match[0];
    const parts = match[1]!.split("|").map((part) => part.trim());
    const namePart = normalizeTemplateName(parts[0]!);

    if (
      ["multiple", "複数の問題", "multiple issues", "article issues"].includes(
        namePart,
      )
    ) {
      const hasSection = parts.some((part) =>
        part.replaceAll(" ", "").startsWith("section="),
      );
      if (!hasSection) {
        replaceTemplate(block);
      }
    } else if (issueTemplateMaps.has(namePart)) {
      const hasSection = parts.some((part) =>
        part.replaceAll(" ", "").startsWith("section="),
      );
      if (!hasSection) {
        if (
          namePart === "信頼性" ||
          namePart === "精度" ||
          namePart.toLowerCase() === "disputed" ||
          namePart === "正確性"
        ) {
          const otherParams = parts
            .slice(1)
            .filter(
              (part) =>
                !part.replaceAll(" ", "").startsWith("date=") &&
                !part.replaceAll(" ", "").startsWith("ソートキー="),
            );
          if (otherParams.length > 0) {
            continue;
          }
        }

        replaceTemplate(block);
      }
    }
  }

  const contentWithoutTemplateArea = replaced
    ? outputString.replace(ISSUE_TEMPLATE_AREA, "")
    : outputString;
  const outputAfterHatnotes = insertIssueTemplateAreaAfterHatnotes(
    contentWithoutTemplateArea,
  );

  if (outputAfterHatnotes !== null) {
    outputString = outputAfterHatnotes;
  } else if (!replaced) {
    outputString = ISSUE_TEMPLATE_AREA + contentWithoutTemplateArea;
  }

  return outputString;
}

export function formatDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string,
) {
  const timezoneValue = TIMEZONE_VALUES.get(timezone);
  if (timezoneValue === undefined) {
    throw new Error("Invalid timezone");
  }
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const date = new Date(
    Date.UTC(year, month - 1, day, hour - timezoneValue, minute),
  );
  const yearStr = date.getUTCFullYear();
  const monthStr = date.getUTCMonth() + 1;
  const dayStr = date.getUTCDate();
  const weekdayStr = weekdays[date.getUTCDay()];
  const hourStr = ("0" + date.getUTCHours()).slice(-2);
  const minuteStr = ("0" + date.getUTCMinutes()).slice(-2);
  return `${yearStr}年${monthStr}月${dayStr}日 (${weekdayStr}) ${hourStr}:${minuteStr}`;
}

export function pageNameToNamespace(pageName: string) {
  const namespace = pageName.split(":")[0] || "";
  const namespaceNumber =
    mw.config.get("wgNamespaceIds")[namespace.toLowerCase()];
  return namespaceNumber;
}
