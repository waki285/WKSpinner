import { describe, expect, it } from "vitest";

import { ISSUE_TEMPLATE_AREA } from "../src/constants";
import { replaceFirstAndRemoveOtherIssueTemplates } from "../src/util";

const MULTIPLE_ISSUES_TEMPLATE = `{{複数の問題
|一次資料=2026年8月
|特筆性=2026年8月
}}
`;

function mergeIssueTemplates(input: string): string {
  return replaceFirstAndRemoveOtherIssueTemplates(input).replace(
    ISSUE_TEMPLATE_AREA,
    MULTIPLE_ISSUES_TEMPLATE,
  );
}

describe("replaceFirstAndRemoveOtherIssueTemplates", () => {
  it.each([
    {
      name: "keeps one newline between separate templates and the body",
      input:
        "{{一次資料|date=2020年5月}}\n{{特筆性|date=2020年5月}}\n'''なんとかなんとか'''は、～",
      expected: `${MULTIPLE_ISSUES_TEMPLATE}'''なんとかなんとか'''は、～`,
    },
    {
      name: "keeps a blank line after adjacent templates",
      input:
        "{{一次資料|date=2020年5月}}{{特筆性|date=2020年5月}}\n\nなんとかなんとかは、～",
      expected: `${MULTIPLE_ISSUES_TEMPLATE}\nなんとかなんとかは、～`,
    },
    {
      name: "adds one newline when no issue template exists",
      input: "'''なんとかなんとか'''は、～",
      expected: `${MULTIPLE_ISSUES_TEMPLATE}'''なんとかなんとか'''は、～`,
    },
    {
      name: "handles CRLF line endings without adding blank lines",
      input:
        "{{一次資料|date=2020年5月}}\r\n{{特筆性|date=2020年5月}}\r\n'''なんとかなんとか'''は、～",
      expected: `${MULTIPLE_ISSUES_TEMPLATE}'''なんとかなんとか'''は、～`,
    },
  ])("$name", ({ input, expected }) => {
    expect(mergeIssueTemplates(input)).toBe(expected);
  });
});
