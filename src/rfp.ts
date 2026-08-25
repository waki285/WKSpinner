export type ProtectionEntry = {
  type: string;
  level: string;
  expiry: string;
  source?: string;
};

export type PageProtectionStatus = {
  title: string;
  missing: boolean;
  protections: readonly ProtectionEntry[];
};

export type ProtectionRequestMode = "protect" | "unprotect";

export type ParsedRequestSection = {
  index: string;
  line: string;
  fromtitle?: string;
};

const PROTECTION_TYPE_LABELS: Readonly<Record<string, string>> = {
  create: "作成",
  edit: "編集",
  move: "移動",
  upload: "アップロード",
};

const PROTECTION_LEVEL_LABELS: Readonly<Record<string, string>> = {
  all: "全利用者",
  autoconfirmed: "半保護",
  extendedconfirmed: "拡張半保護",
  sysop: "全保護",
  templateeditor: "テンプレート編集者保護",
};

function formatExpiry(expiry: string) {
  if (expiry === "infinity" || expiry === "infinite") {
    return "無期限";
  }

  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) {
    return `${expiry}まで`;
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日 ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} (UTC)まで`;
}

export function hasActiveProtection(status: PageProtectionStatus) {
  return status.protections.length > 0;
}

export function getDefaultProtectionRequestMode(
  status: PageProtectionStatus,
): ProtectionRequestMode {
  return hasActiveProtection(status) ? "unprotect" : "protect";
}

export function findRequestSection(
  sections: readonly ParsedRequestSection[],
  requestPageName: string,
  sectionName: string,
) {
  const normalizedRequestPageName = requestPageName.replaceAll("_", " ");

  return sections.find((section) => {
    const isOwnSection =
      section.fromtitle === undefined ||
      section.fromtitle.replaceAll("_", " ") === normalizedRequestPageName;

    return (
      /^\d+$/.test(section.index) &&
      isOwnSection &&
      section.line.includes(sectionName)
    );
  });
}

export function formatPageProtectionStatus(status: PageProtectionStatus) {
  if (!hasActiveProtection(status)) {
    return status.missing ? "ページが存在しません" : "保護されていません";
  }

  return status.protections
    .map((protection) => {
      const type = PROTECTION_TYPE_LABELS[protection.type] ?? protection.type;
      const level =
        PROTECTION_LEVEL_LABELS[protection.level] ?? protection.level;
      const source = protection.source
        ? `、カスケード元: ${protection.source}`
        : "";
      return `${type}: ${level} (${formatExpiry(protection.expiry)}${source})`;
    })
    .join("、");
}
