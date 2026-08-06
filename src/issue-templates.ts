import {
  ALL_ISSUE_CHOICES,
  HATNOTE_TEMPLATES,
  ISSUE_TEMPLATE_AREA,
  MI_CHOICES,
  type IssueTemplateParam,
  type MIChoice,
  type StandaloneIssueChoice,
} from "./constants";

type IssueChoice = MIChoice | StandaloneIssueChoice;

const SUMMARY_TEMPLATE_LIMIT = 5;
const DEFAULT_SUMMARY_FORMAT = "+{{$t}}";

function getSingleParamName(
  choice: IssueChoice,
  param: IssueTemplateParam,
): string {
  if (param.singleName !== null) {
    return param.singleName ?? param.name;
  }

  if (param.position !== undefined) {
    return String(param.position);
  }

  return String(
    choice.params
      .slice(0, choice.params.indexOf(param) + 1)
      .filter(({ singleName }) => singleName === null).length,
  );
}

export function getIssueTemplateParamName(
  choice: IssueChoice,
  param: IssueTemplateParam,
): string {
  return getSingleParamName(choice, param);
}

function getTemplateParamValue(
  param: IssueTemplateParam,
  rawValue: string,
): string {
  if (param.type === "input") {
    return rawValue;
  }

  const selected = param.choices.find(({ id }) => id === rawValue);
  return selected?.value ?? selected?.name ?? "";
}

export function buildSingleIssueTemplate(
  choice: IssueChoice,
  values: Readonly<Record<string, string>>,
  date: string,
): string {
  const namedParams: string[] = [];
  const positionalParams = new Map<number, string>();

  for (const param of choice.params) {
    const rawValue = values[param.id] ?? "";
    if (rawValue === "" || rawValue === "null") {
      continue;
    }

    const value = getTemplateParamValue(param, rawValue);
    const paramName = getSingleParamName(choice, param);
    if (param.singleName === null) {
      positionalParams.set(Number(paramName), value);
    } else {
      namedParams.push(`|${paramName}=${value}`);
    }
  }

  const positionalText = positionalParams.size
    ? Array.from(
        { length: Math.max(...positionalParams.keys()) },
        (_, index) => `|${positionalParams.get(index + 1) ?? ""}`,
      ).join("")
    : "";
  const dateText =
    "hasDate" in choice && !choice.hasDate ? "" : `|date=${date}`;

  return `{{${choice.name}${positionalText}${namedParams.join("")}${dateText}}}`;
}

export function buildMultipleIssueTemplate(
  choices: readonly MIChoice[],
  values: Readonly<Record<string, Readonly<Record<string, string>>>>,
  dates: Readonly<Record<string, string>>,
): string {
  const lines = choices.map((choice) => {
    const params = choice.params
      .map((param) => {
        if (param.multipleName === null) {
          return "";
        }
        const rawValue = values[choice.id]?.[param.id] ?? "";
        if (rawValue === "" || rawValue === "null") {
          return "";
        }
        return `|${param.multipleName ?? param.name}=${getTemplateParamValue(param, rawValue)}`;
      })
      .join("");
    return `|${choice.name}=${dates[choice.id] ?? ""}${params}`;
  });

  return `{{複数の問題\n${lines.join("\n")}\n}}`;
}

export function partitionMultipleIssueChoices(
  choices: readonly MIChoice[],
  values: Readonly<Record<string, Readonly<Record<string, string>>>>,
): {
  groupable: MIChoice[];
  standalone: MIChoice[];
} {
  const groupable: MIChoice[] = [];
  const standalone: MIChoice[] = [];

  for (const choice of choices) {
    const hasStandaloneOnlyValue = choice.params.some((param) => {
      if (param.multipleName !== null) {
        return false;
      }
      const value = values[choice.id]?.[param.id] ?? "";
      return value !== "" && value !== "null";
    });
    (hasStandaloneOnlyValue ? standalone : groupable).push(choice);
  }

  return { groupable, standalone };
}

export function buildSelectedIssueTemplates(
  multipleChoices: readonly MIChoice[],
  standaloneChoices: readonly StandaloneIssueChoice[],
  values: Readonly<Record<string, Readonly<Record<string, string>>>>,
  dates: Readonly<Record<string, string>>,
): string[] {
  const { groupable, standalone: separatedChoices } =
    partitionMultipleIssueChoices(multipleChoices, values);
  const templates: string[] = [];

  if (groupable.length >= 2) {
    templates.push(buildMultipleIssueTemplate(groupable, values, dates));
  } else if (groupable[0]) {
    templates.push(
      buildSingleIssueTemplate(
        groupable[0],
        values[groupable[0].id] ?? {},
        dates[groupable[0].id] ?? "",
      ),
    );
  }

  for (const choice of [...separatedChoices, ...standaloneChoices]) {
    templates.push(
      buildSingleIssueTemplate(
        choice,
        values[choice.id] ?? {},
        dates[choice.id] ?? "",
      ),
    );
  }

  return templates;
}

export function formatIssueTemplateSummary(
  format: string,
  templateNames: readonly string[],
): string {
  const normalizedFormat = format || DEFAULT_SUMMARY_FORMAT;
  if (!templateNames.length) {
    return normalizedFormat
      .replaceAll("{{$s1}}", "問題テンプレートを除去")
      .replaceAll("{{$t}}", "問題テンプレートを除去")
      .replaceAll("$s1", "問題テンプレートを除去")
      .replaceAll("$t", "問題テンプレートを除去");
  }

  return normalizedFormat
    .replaceAll("$s1", templateNames[0]!)
    .replaceAll(
      "$t",
      templateNames.slice(0, SUMMARY_TEMPLATE_LIMIT).join("}}, {{"),
    );
}

// ---------------------------------------------------------------------------
// Issue template extraction / replacement helpers, moved here from util.ts
// so that the large MI_CHOICES / STANDALONE_ISSUE_CHOICES / ALL_ISSUE_CHOICES
// / HATNOTE_TEMPLATES constants are only bundled into the mi module, not the
// core bundle.
// ---------------------------------------------------------------------------

export function normalizeTemplateName(name: string) {
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
