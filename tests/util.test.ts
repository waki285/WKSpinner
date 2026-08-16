import { describe, expect, it } from "vitest";

import { HATNOTE_TEMPLATES, ISSUE_TEMPLATE_AREA } from "../src/constants";
import { replaceFirstAndRemoveOtherIssueTemplates } from "../src/issue-templates";

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

  const hatnoteTemplateNames = HATNOTE_TEMPLATES.flatMap(
    ({ name, aliases }) => [name, ...aliases],
  );

  it.each(hatnoteTemplateNames)(
    "places the issue template below the %s hatnote or alias",
    (templateName) => {
      const input = `{{${templateName}}}\nBODY`;
      const expected = `{{${templateName}}}\n${MULTIPLE_ISSUES_TEMPLATE}BODY`;

      expect(mergeIssueTemplates(input)).toBe(expected);
    },
  );

  it("normalizes template namespace, casing, and underscores", () => {
    const input = "{{Template:OTHER_USES}}\nBODY";
    const expected = `{{Template:OTHER_USES}}\n${MULTIPLE_ISSUES_TEMPLATE}BODY`;

    expect(mergeIssueTemplates(input)).toBe(expected);
  });

  it("places the issue template below all hatnotes", () => {
    const input = "{{Otheruses}}\n{{Redirect}}\nBODY";
    const expected = `{{Otheruses}}\n{{Redirect}}\n${MULTIPLE_ISSUES_TEMPLATE}BODY`;

    expect(mergeIssueTemplates(input)).toBe(expected);
  });

  it("preserves a blank line between the hatnote area and the body", () => {
    const input = "{{Otheruses}}\n\nBODY";
    const expected = `{{Otheruses}}\n${MULTIPLE_ISSUES_TEMPLATE}\nBODY`;

    expect(mergeIssueTemplates(input)).toBe(expected);
  });

  it("adds a line break after an inline hatnote", () => {
    const input = "{{Otheruses}}BODY";
    const expected = `{{Otheruses}}\n${MULTIPLE_ISSUES_TEMPLATE}BODY`;

    expect(mergeIssueTemplates(input)).toBe(expected);
  });

  it("moves an existing issue template below a hatnote", () => {
    const input = "{{一次資料|date=2020年5月}}\n{{Otheruses}}\nBODY";
    const expected = `{{Otheruses}}\n${MULTIPLE_ISSUES_TEMPLATE}BODY`;

    expect(mergeIssueTemplates(input)).toBe(expected);
  });

  it("detects a hatnote containing a nested template", () => {
    const input = "{{Hatnote|{{lang|en|Example}}}}\nBODY";
    const expected = `{{Hatnote|{{lang|en|Example}}}}\n${MULTIPLE_ISSUES_TEMPLATE}BODY`;

    expect(mergeIssueTemplates(input)).toBe(expected);
  });

  it("preserves an existing deprecated issue template", () => {
    const input = "{{有償の寄稿|date=2026年5月}}\nBODY";
    const expected = `${MULTIPLE_ISSUES_TEMPLATE}${input}`;

    expect(mergeIssueTemplates(input)).toBe(expected);
  });
});
