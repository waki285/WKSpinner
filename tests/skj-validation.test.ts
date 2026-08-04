import { describe, expect, it } from "vitest";

import { getPageIdPrivacyWarnings } from "../src/skj-validation";

const summaries = [
  { label: "Sakujo貼り付け", value: "+Sakujo" },
  { label: "依頼ページ作成", value: "削除依頼" },
  { label: "ログへの追記", value: "削除依頼の追加" },
];

describe("getPageIdPrivacyWarnings", () => {
  it("does not warn when page IDs are not used", () => {
    expect(
      getPageIdPrivacyWarnings({
        usePageId: false,
        requestPageName: "秘密の記事 20260805",
        targetPageName: "秘密の記事",
        summaries: [{ label: "依頼ページ作成", value: "+$p" }],
      }),
    ).toEqual([]);
  });

  it("warns when the request page name contains the target page name", () => {
    expect(
      getPageIdPrivacyWarnings({
        usePageId: true,
        requestPageName: "秘密の 記事 20260805",
        targetPageName: "秘密の_記事",
        summaries,
      }),
    ).toContain(
      "ページIDを使用する場合、削除依頼ページ名に対象ページ名を含めないでください。",
    );
  });

  it("identifies every summary field containing $p", () => {
    expect(
      getPageIdPrivacyWarnings({
        usePageId: true,
        requestPageName: "12345678",
        targetPageName: "秘密の記事",
        summaries: [
          { label: "Sakujo貼り付け", value: "+$p" },
          { label: "依頼ページ作成", value: "削除依頼: $p" },
          { label: "ログへの追記", value: "+$d" },
        ],
      }),
    ).toEqual([
      "ページIDを使用する場合、Sakujo貼り付けの要約に $p を使用しないでください。",
      "ページIDを使用する場合、依頼ページ作成の要約に $p を使用しないでください。",
    ]);
  });

  it("accepts an anonymous request page name and summaries", () => {
    expect(
      getPageIdPrivacyWarnings({
        usePageId: true,
        requestPageName: "12345678",
        targetPageName: "秘密の記事",
        summaries,
      }),
    ).toEqual([]);
  });
});
