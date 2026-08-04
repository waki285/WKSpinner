import type {
  IssueTemplateParam,
  MIChoice,
  StandaloneIssueChoice,
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
