type SummaryField = {
  label: string;
  value: string;
};

type PageIdPrivacyInput = {
  usePageId: boolean;
  requestPageName: string;
  targetPageName: string;
  summaries: readonly SummaryField[];
};

function normalizePageName(value: string): string {
  return value
    .normalize("NFKC")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("ja");
}

export function getPageIdPrivacyWarnings({
  usePageId,
  requestPageName,
  targetPageName,
  summaries,
}: PageIdPrivacyInput): string[] {
  if (!usePageId) {
    return [];
  }

  const warnings: string[] = [];
  const normalizedRequestPageName = normalizePageName(requestPageName);
  const normalizedTargetPageName = normalizePageName(targetPageName);
  if (
    normalizedTargetPageName &&
    normalizedRequestPageName.includes(normalizedTargetPageName)
  ) {
    warnings.push(
      "ページIDを使用する場合、削除依頼ページ名に対象ページ名を含めないでください。",
    );
  }

  for (const summary of summaries) {
    if (summary.value.includes("$p")) {
      warnings.push(
        `ページIDを使用する場合、${summary.label}の要約に $p を使用しないでください。`,
      );
    }
  }

  return warnings;
}
