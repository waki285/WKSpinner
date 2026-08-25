import { describe, expect, it } from "vitest";

import {
  findRequestSection,
  formatPageProtectionStatus,
  getDefaultProtectionRequestMode,
  hasActiveProtection,
  type PageProtectionStatus,
} from "../src/rfp";

const unprotected: PageProtectionStatus = {
  title: "Example",
  missing: false,
  protections: [],
};

describe("protection request helpers", () => {
  it("selects the request page section instead of a transcluded section", () => {
    const sections = [
      {
        index: "T-4",
        line: "8月下旬",
        fromtitle: "Wikipedia:保護依頼/見送り",
      },
      {
        index: "5",
        line: "8月下旬（21日から末日まで）",
        fromtitle: "Wikipedia:保護依頼",
      },
    ];

    expect(
      findRequestSection(sections, "Wikipedia:保護依頼", "8月下旬"),
    ).toEqual(sections[1]);
  });

  it("accepts a renumbered section belonging to the request page", () => {
    const section = {
      index: "6",
      line: "8月下旬（21日から末日まで）",
      fromtitle: "Wikipedia:保護依頼",
    };

    expect(findRequestSection([section], "Wikipedia:保護依頼", "8月下旬")).toBe(
      section,
    );
  });

  it("defaults to a protection request for an unprotected page", () => {
    expect(hasActiveProtection(unprotected)).toBe(false);
    expect(getDefaultProtectionRequestMode(unprotected)).toBe("protect");
    expect(formatPageProtectionStatus(unprotected)).toBe("保護されていません");
  });

  it("defaults to an unprotection request and describes active protections", () => {
    const protectedPage: PageProtectionStatus = {
      title: "Example",
      missing: false,
      protections: [
        {
          type: "edit",
          level: "autoconfirmed",
          expiry: "2026-09-01T12:30:00Z",
        },
        {
          type: "move",
          level: "sysop",
          expiry: "infinity",
        },
      ],
    };

    expect(hasActiveProtection(protectedPage)).toBe(true);
    expect(getDefaultProtectionRequestMode(protectedPage)).toBe("unprotect");
    expect(formatPageProtectionStatus(protectedPage)).toBe(
      "編集: 半保護 (2026年9月1日 12:30 (UTC)まで)、移動: 全保護 (無期限)",
    );
  });

  it("distinguishes a missing page without creation protection", () => {
    expect(
      formatPageProtectionStatus({
        title: "Missing",
        missing: true,
        protections: [],
      }),
    ).toBe("ページが存在しません");
  });

  it("reports creation protection on a missing title", () => {
    const status: PageProtectionStatus = {
      title: "Missing",
      missing: true,
      protections: [
        {
          type: "create",
          level: "sysop",
          expiry: "infinity",
          source: "Example",
        },
      ],
    };

    expect(getDefaultProtectionRequestMode(status)).toBe("unprotect");
    expect(formatPageProtectionStatus(status)).toBe(
      "作成: 全保護 (無期限、カスケード元: Example)",
    );
  });
});
