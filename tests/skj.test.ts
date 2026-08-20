import { describe, expect, it, vi } from "vitest";

import {
  appendRedirectDeletionRequest,
  fetchCurrentRedirectTarget,
  getDeletionRequestReason,
  getRedirectDeletionRequestSectionHeading,
  getRedirectDeletionRequestText,
  getUserPageDeletionReference,
  getUserPageDeletionRequestSection,
  getUserPageDeletionRequestText,
  getUserPageDeletionSectionTitle,
  hasUserPageDeletionRequest,
  hasRedirectDeletionRequest,
  isUserPageDeletionNamespace,
} from "../src/skj";

describe("redirect deletion requests", () => {
  it("detects the current target including a section fragment", async () => {
    const get = vi.fn().mockResolvedValue({
      query: {
        redirects: [{ from: "転送元", to: "転送先", tofragment: "節" }],
      },
    });

    await expect(
      fetchCurrentRedirectTarget({ get } as unknown as mw.Api, "転送元"),
    ).resolves.toBe("転送先#節");
    expect(get).toHaveBeenCalledWith(
      expect.objectContaining({ titles: "転送元", redirects: 1 }),
    );
  });

  it("returns null for a non-redirect", async () => {
    const get = vi.fn().mockResolvedValue({ query: { pages: [{}] } });
    await expect(
      fetchCurrentRedirectTarget({ get } as unknown as mw.Api, "記事"),
    ).resolves.toBeNull();
  });

  it.each([
    ["2026-08-05T14:59:59Z", "2026年8月1日 - 5日新規依頼"],
    ["2026-08-05T15:00:00Z", "2026年8月6日 - 10日新規依頼"],
    ["2026-02-27T15:00:00Z", "2026年2月26日 - 28日新規依頼"],
  ])("selects the JST request section for %s", (timestamp, expected) => {
    expect(getRedirectDeletionRequestSectionHeading(new Date(timestamp))).toBe(
      expected,
    );
  });

  it("formats an RFD request and protects positional arguments", () => {
    expect(
      getRedirectDeletionRequestText(
        "転送=元",
        "転送=先",
        "方針のケースに該当。--~~~~",
        "（削除） 依頼者票。",
      ),
    ).toBe(
      "* {{RFD|1=転送=元|2=転送=先}} - （削除） 依頼者票。 方針のケースに該当。 --~~~~",
    );
  });

  it("appends a request inside the current period section", () => {
    const content = `== リダイレクトの削除依頼 ==
=== 2026年8月16日 - 20日新規依頼 ===
* 既存依頼

=== 2026年8月21日 - 25日新規依頼 ===
`;
    expect(
      appendRedirectDeletionRequest(
        content,
        "2026年8月16日 - 20日新規依頼",
        "* 新規依頼",
      ),
    ).toContain("* 既存依頼\n\n* 新規依頼\n\n=== 2026年8月21日");
  });

  it("rejects a missing period section", () => {
    expect(() =>
      appendRedirectDeletionRequest("== 受付 ==", "存在しない節", "* 依頼"),
    ).toThrow("受付ページに「存在しない節」節がありません。");
  });

  it("detects an existing RFD request across underscore differences", () => {
    expect(
      hasRedirectDeletionRequest(
        "* {{RFD|1=転送_元|転送先}} - 理由",
        "転送 元",
      ),
    ).toBe(true);
  });
});

describe("isUserPageDeletionNamespace", () => {
  it.each([2, 3])("accepts namespace %i", (namespaceNumber) => {
    expect(isUserPageDeletionNamespace(namespaceNumber)).toBe(true);
  });

  it.each([0, 1, 4, 10])("rejects namespace %i", (namespaceNumber) => {
    expect(isUserPageDeletionNamespace(namespaceNumber)).toBe(false);
  });
});

describe("user page deletion request formatting", () => {
  it("uses the page name by default", () => {
    expect(getUserPageDeletionReference("利用者:Example", 123, false)).toBe(
      "利用者:Example",
    );
  });

  it("uses a page-ID redirect without exposing the page name", () => {
    expect(getUserPageDeletionReference("利用者:危険な名前", 123, true)).toBe(
      "特別:転送/page/123",
    );
  });

  it("builds a marked Page heading", () => {
    expect(
      getUserPageDeletionSectionTitle("利用者‐会話:Example", {
        rights: true,
        emergency: true,
        revision: true,
      }),
    ).toBe("(*緊特){{Page|利用者‐会話:Example}}");
  });

  it("uses an explicit positional argument for a title containing equals", () => {
    expect(
      getUserPageDeletionSectionTitle("利用者:Example/a=b", {
        rights: false,
        emergency: false,
        revision: false,
      }),
    ).toBe("{{Page|1=利用者:Example/a=b}}");
  });

  it("uses a clean page-ID link instead of applying Page to a special page", () => {
    expect(
      getUserPageDeletionSectionTitle("特別:転送/page/123", {
        rights: false,
        emergency: true,
        revision: false,
      }),
    ).toBe("(緊)[[特別:転送/page/123|ページID: 123]]");
  });

  it("formats the reason and requester vote", () => {
    expect(
      getUserPageDeletionRequestText("ケースB。", "{{AFD|削除}} 依頼者票。"),
    ).toBe("ケースB。\n* {{AFD|削除}} 依頼者票。 --~~~~");
  });

  it("wraps a request in a level-three section", () => {
    expect(
      getUserPageDeletionRequestSection(
        "{{Page|利用者:Example}}",
        "理由\n* 依頼者票 --~~~~",
      ),
    ).toBe("=== {{Page|利用者:Example}} ===\n理由\n* 依頼者票 --~~~~");
  });
});

describe("getDeletionRequestReason", () => {
  it("leaves an unsigned reason unchanged", () => {
    expect(getDeletionRequestReason("理由\n", false)).toBe("理由\n");
  });

  it("normalizes an existing signature before signing", () => {
    expect(getDeletionRequestReason("理由 --~~~~\n", true)).toBe("理由--~~~~");
  });
});

describe("hasUserPageDeletionRequest", () => {
  const content = `== 削除依頼 ==
=== (*特){{Page|利用者:Example_User}} ===
理由
=== {{Page|1=利用者:Example/a=b}} ===
理由
=== (*緊)[[特別:転送/page/123|ページID: 123]] ===
理由`;

  it("finds a page-name request across underscore differences", () => {
    expect(hasUserPageDeletionRequest(content, "利用者:Example User")).toBe(
      true,
    );
  });

  it("finds an explicit positional Page argument", () => {
    expect(hasUserPageDeletionRequest(content, "利用者:Example/a=b")).toBe(
      true,
    );
  });

  it("finds a page-ID request", () => {
    expect(hasUserPageDeletionRequest(content, "特別:転送/page/123")).toBe(
      true,
    );
  });

  it("does not match another request", () => {
    expect(hasUserPageDeletionRequest(content, "利用者:Other")).toBe(false);
  });
});
