import { describe, expect, it } from "vitest";

import {
  getDeletionRequestReason,
  getUserPageDeletionReference,
  getUserPageDeletionRequestSection,
  getUserPageDeletionRequestText,
  getUserPageDeletionSectionTitle,
  hasUserPageDeletionRequest,
  isUserPageDeletionNamespace,
} from "../src/skj";

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
