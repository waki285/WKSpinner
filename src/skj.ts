export type DeletionRequestMarks = {
  rights: boolean;
  emergency: boolean;
  revision: boolean;
};

type RedirectQueryResponse = {
  query?: {
    redirects?: { from: string; to: string; tofragment?: string }[];
  };
};

export type RedirectDeletionRequestItem = {
  source: string;
  target: string;
  revisionId: number;
  hideTarget: boolean;
  hideSource: boolean;
};

export type RedirectDeletionSummaryItem = Pick<
  RedirectDeletionRequestItem,
  "source" | "hideSource"
>;

export function expandRedirectDeletionSummaryPageNames(
  summary: string,
  items: RedirectDeletionSummaryItem[],
): string {
  const pageNames = items.map((item) =>
    item.hideSource ? "非公開のリダイレクト" : item.source,
  );
  const linkedPageNames = items.map((item) =>
    item.hideSource ? "非公開のリダイレクト" : `[[${item.source}]]`,
  );
  return summary
    .replaceAll("[[$p]]", linkedPageNames.join("、"))
    .replaceAll("$p", pageNames.join("、"));
}

export async function fetchCurrentRedirectTarget(api: mw.Api, title: string) {
  const response = (await api.get({
    action: "query",
    titles: title,
    redirects: 1,
    formatversion: "2",
  })) as RedirectQueryResponse;
  const redirect = response.query?.redirects?.[0];
  if (!redirect) {
    return null;
  }
  return `${redirect.to}${redirect.tofragment ? `#${redirect.tofragment}` : ""}`;
}

export function getRedirectDeletionRequestSectionHeading(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const year = Number(parts.find(({ type }) => type === "year")?.value);
  const month = Number(parts.find(({ type }) => type === "month")?.value);
  const day = Number(parts.find(({ type }) => type === "day")?.value);
  const rangeStart = day >= 26 ? 26 : Math.floor((day - 1) / 5) * 5 + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const rangeEnd = rangeStart === 26 ? lastDay : rangeStart + 4;
  return `${year}年${month}月${rangeStart}日 - ${rangeEnd}日新規依頼`;
}

function getTemplateArgument(value: string, position: number) {
  return value.includes("=") ? `${position}=${value}` : value;
}

export function getRedirectDeletionRequestText(
  items: RedirectDeletionRequestItem[],
  reason: string,
  requesterVote: string,
) {
  const normalizedReason = reason
    .replace(/--~~~~\s*$/u, "")
    .replace(/~~~~\s*$/u, "")
    .trim();
  const requestLines = items.map((item) => {
    if (item.hideSource) {
      return `* {{Oldid|${item.revisionId}}}`;
    }
    if (item.hideTarget) {
      return `* {{リダイレクト|${getTemplateArgument(item.source, 1)}}}`;
    }
    return `* {{RFD|${getTemplateArgument(item.source, 1)}|${getTemplateArgument(item.target, 2)}}}`;
  });
  const requestComment = `${[requesterVote.trim(), normalizedReason]
    .filter(Boolean)
    .join(" ")} --~~~~`;
  return items.length === 1
    ? `${requestLines[0]} - ${requestComment}`
    : `${requestLines.join("\n")}\n** ${requestComment}`;
}

export function appendRedirectDeletionRequest(
  pageContent: string,
  sectionHeading: string,
  requestText: string,
) {
  const headingPattern = new RegExp(
    `^===\\s*${sectionHeading.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*===\\s*$`,
    "mu",
  );
  const headingMatch = headingPattern.exec(pageContent);
  if (!headingMatch) {
    throw new Error(`受付ページに「${sectionHeading}」節がありません。`);
  }
  const sectionStart = headingMatch.index + headingMatch[0].length;
  const nextHeading = /^===\s*.+?\s*===\s*$/gmu;
  nextHeading.lastIndex = sectionStart;
  const nextHeadingMatch = nextHeading.exec(pageContent);
  const sectionEnd = nextHeadingMatch?.index ?? pageContent.length;
  const newline = pageContent.includes("\r\n") ? "\r\n" : "\n";
  const before = pageContent.slice(0, sectionEnd).replace(/\s+$/u, "");
  const after = pageContent.slice(sectionEnd);
  return `${before}${newline}${newline}${requestText.trim()}${newline}${
    after ? newline : ""
  }${after}`;
}

export function hasRedirectDeletionRequest(
  requestPageContent: string,
  source: string,
  revisionId?: number,
) {
  const normalizedSource = normalizePageReference(source);
  const requestPatterns = [
    /\{\{\s*RFD\s*\|\s*(?:1\s*=\s*)?([^|}\n]+)/giu,
    /\{\{\s*リダイレクト\s*\|\s*(?:1\s*=\s*)?([^|}\n]+)/giu,
  ];
  if (
    requestPatterns.some((pattern) =>
      [...requestPageContent.matchAll(pattern)].some(
        (match) => normalizePageReference(match[1] ?? "") === normalizedSource,
      ),
    )
  ) {
    return true;
  }
  if (revisionId === undefined) {
    return false;
  }
  const revisionPattern = /(?:[?&]oldid\s*=|\{\{\s*oldid\s*\|\s*)(\d+)/giu;
  return [...requestPageContent.matchAll(revisionPattern)].some(
    (match) => Number(match[1]) === revisionId,
  );
}

export function isUserPageDeletionNamespace(namespaceNumber: number): boolean {
  return namespaceNumber === 2 || namespaceNumber === 3;
}

export function getDeletionRequestReason(
  reasonRaw: string,
  signReason: boolean,
): string {
  if (!signReason) {
    return reasonRaw;
  }

  const reason = reasonRaw
    .replace(/--~~~~\s*$/, "")
    .replace(/~~~~\s*$/, "")
    .replace(/\s+$/, "");
  return `${reason}--~~~~`;
}

export function getUserPageDeletionReference(
  pageName: string,
  pageId: number,
  usePageId: boolean,
): string {
  return usePageId ? `特別:転送/page/${pageId}` : pageName;
}

function getRequestMarkText(marks: DeletionRequestMarks): string {
  return `${marks.rights ? "*" : ""}${marks.emergency ? "緊" : ""}${
    marks.revision ? "特" : ""
  }`;
}

export function getUserPageDeletionSectionTitle(
  reference: string,
  marks: DeletionRequestMarks,
): string {
  const markText = getRequestMarkText(marks);
  const pageIdMatch = /^特別:転送\/page\/(\d+)$/u.exec(reference);
  if (pageIdMatch) {
    return `${markText ? `(${markText})` : ""}[[${reference}|ページID: ${pageIdMatch[1]}]]`;
  }
  const pageArgument = reference.includes("=") ? `1=${reference}` : reference;
  return `${markText ? `(${markText})` : ""}{{Page|${pageArgument}}}`;
}

export function getUserPageDeletionRequestText(
  reason: string,
  requesterVote: string,
): string {
  return `${reason}\n* ${requesterVote} --~~~~`;
}

export function getUserPageDeletionRequestSection(
  sectionTitle: string,
  requestText: string,
): string {
  return `=== ${sectionTitle} ===\n${requestText}`;
}

function normalizePageReference(value: string): string {
  return value.replaceAll("_", " ").trim().toLocaleLowerCase("ja");
}

export function hasUserPageDeletionRequest(
  requestPageContent: string,
  reference: string,
): boolean {
  const normalizedReference = normalizePageReference(reference);
  const sectionPattern = /^={3,}\s*(.*?)\s*={3,}\s*$/gimu;

  return [...requestPageContent.matchAll(sectionPattern)].some((match) => {
    const heading = match[1] ?? "";
    const pageTemplateMatch =
      /\{\{\s*Page\s*\|\s*(?:1\s*=\s*)?([^|}\n]+)[^}\n]*\}\}/iu.exec(heading);
    const pageLinkMatch = /\[\[\s*([^|\]\n]+)(?:\|[^\]\n]*)?\]\]/u.exec(
      heading,
    );
    const headingReference = pageTemplateMatch?.[1] ?? pageLinkMatch?.[1];
    return (
      headingReference !== undefined &&
      normalizePageReference(headingReference) === normalizedReference
    );
  });
}
