export type DeletionRequestMarks = {
  rights: boolean;
  emergency: boolean;
  revision: boolean;
};

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
