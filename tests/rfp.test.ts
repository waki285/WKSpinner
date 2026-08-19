import { describe, expect, it } from "vitest";

import {
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
