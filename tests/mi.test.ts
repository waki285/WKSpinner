import { describe, expect, it } from "vitest";

import {
  MI_CHOICES,
  STANDALONE_ISSUE_CHOICES,
  type MIChoice,
  type StandaloneIssueChoice,
} from "../src/constants";
import {
  buildMultipleIssueTemplate,
  buildSingleIssueTemplate,
  partitionMultipleIssueChoices,
} from "../src/issue-templates";
import { extractIssueTemplates } from "../src/util";

function standalone(id: string): StandaloneIssueChoice {
  const choice = STANDALONE_ISSUE_CHOICES.find((item) => item.id === id);
  if (!choice) {
    throw new Error(`Standalone issue template not found: ${id}`);
  }
  return choice;
}

function multiple(id: string): MIChoice {
  const choice = MI_CHOICES.find((item) => item.id === id);
  if (!choice) {
    throw new Error(`Multiple issue template not found: ${id}`);
  }
  return choice;
}

describe("issue template definitions", () => {
  it("keeps standalone templates separate from multiple-issue choices", () => {
    const multipleIds = new Set<string>(MI_CHOICES.map(({ id }) => id));

    expect(STANDALONE_ISSUE_CHOICES).toHaveLength(30);
    expect(
      STANDALONE_ISSUE_CHOICES.every(({ id }) => !multipleIds.has(id)),
    ).toBe(true);
  });

  it.each([
    "自分自身の記事",
    "ファンサイト的",
    "導入部が長い",
    "導入部が短い",
    "百科事典的でない",
    "専門的",
    "リンク過剰",
  ])("includes %s in the multiple-issue choices", (name) => {
    expect(MI_CHOICES.some((choice) => choice.name === name)).toBe(true);
  });

  it.each([
    "スポーツ選手の出典明記",
    "リンクのみの節",
    "年譜のみの経歴",
    "関連項目過剰",
    "Empty section",
    "不十分なあらすじ",
    "要あらすじ",
  ])("excludes the section-only template %s", (name) => {
    expect(
      STANDALONE_ISSUE_CHOICES.some((choice) => choice.name === name),
    ).toBe(false);
  });
});

describe("buildSingleIssueTemplate", () => {
  it("writes required and optional named parameters with a date", () => {
    expect(
      buildSingleIssueTemplate(
        standalone("ai-generated"),
        {
          reason: "不自然な出典がある",
          talk: "ノート:例#AI生成について",
        },
        "2026年8月",
      ),
    ).toBe(
      "{{AI生成|reason=不自然な出典がある|talk=ノート:例#AI生成について|date=2026年8月}}",
    );
  });

  it("does not add date to a template that does not accept it", () => {
    expect(
      buildSingleIssueTemplate(standalone("tvwatch"), {}, "2026年8月"),
    ).toBe("{{TVWATCH}}");
  });

  it("uses the actual template value for a labeled select option", () => {
    expect(
      buildSingleIssueTemplate(
        standalone("no-footnotes"),
        { blp: "yes" },
        "2026年8月",
      ),
    ).toBe("{{No footnotes|BLP=yes|date=2026年8月}}");
  });

  it("preserves empty positional arguments before a later argument", () => {
    expect(
      buildSingleIssueTemplate(
        standalone("rough-translation"),
        { "source-language": "英語", kind: "section" },
        "2026年8月",
      ),
    ).toBe("{{Rough translation|英語||節}}");
  });

  it("writes parameters that are only available on the standalone form", () => {
    expect(
      buildSingleIssueTemplate(
        multiple("not-encyclopedic"),
        { type: "NOTBLOG" },
        "2026年8月",
      ),
    ).toBe("{{百科事典的でない|type=NOTBLOG|date=2026年8月}}");
  });
});

describe("buildMultipleIssueTemplate", () => {
  it("only groups supported choices and writes their nested parameters", () => {
    expect(
      buildMultipleIssueTemplate(
        [multiple("primary"), multiple("notable")],
        {
          primary: {},
          notable: { genre: "person" },
        },
        {
          primary: "2026年7月",
          notable: "2026年8月",
        },
      ),
    ).toBe(
      "{{複数の問題\n|一次資料=2026年7月\n|特筆性=2026年8月|分野=人物\n}}",
    );
  });

  it("omits parameters unsupported by the multiple-issue wrapper", () => {
    expect(
      buildMultipleIssueTemplate(
        [multiple("not-encyclopedic"), multiple("technical")],
        {
          "not-encyclopedic": { type: "NOTBLOG" },
          technical: {},
        },
        {
          "not-encyclopedic": "2026年8月",
          technical: "2026年8月",
        },
      ),
    ).toBe("{{複数の問題\n|百科事典的でない=2026年8月\n|専門的=2026年8月\n}}");
  });
});

describe("partitionMultipleIssueChoices", () => {
  it("separates 百科事典的でない when its type is specified", () => {
    const notEncyclopedic = multiple("not-encyclopedic");
    const technical = multiple("technical");

    const result = partitionMultipleIssueChoices([notEncyclopedic, technical], {
      "not-encyclopedic": { type: "NOTBLOG" },
      technical: {},
    });

    expect(result.groupable.map(({ id }) => id)).toEqual(["technical"]);
    expect(result.standalone.map(({ id }) => id)).toEqual(["not-encyclopedic"]);
  });

  it("keeps 百科事典的でない groupable when no standalone-only value is set", () => {
    const notEncyclopedic = multiple("not-encyclopedic");
    const technical = multiple("technical");

    const result = partitionMultipleIssueChoices([notEncyclopedic, technical], {
      "not-encyclopedic": { type: "null", text: "" },
      technical: {},
    });

    expect(result.groupable.map(({ id }) => id)).toEqual([
      "not-encyclopedic",
      "technical",
    ]);
    expect(result.standalone).toEqual([]);
  });

  it("also separates choices using another standalone-only parameter", () => {
    const fan = multiple("fan");

    const result = partitionMultipleIssueChoices([fan, multiple("technical")], {
      fan: { talk: "ノート:記事名#議論" },
      technical: {},
    });

    expect(result.groupable.map(({ id }) => id)).toEqual(["technical"]);
    expect(result.standalone.map(({ id }) => id)).toEqual(["fan"]);
  });
});

describe("extractIssueTemplates", () => {
  it("recognizes a standalone template and its positional parameters", () => {
    expect(
      extractIssueTemplates("{{Rough translation|英語||節}}\n本文"),
    ).toContainEqual({
      name: "rough-translation",
      date: "",
      "1": "英語",
      "2": "",
      "3": "節",
    });
  });

  it("recognizes the documented alias of 色の使用", () => {
    expect(extractIssueTemplates("{{色の過剰使用|唯一}}\n本文")).toContainEqual(
      {
        name: "color",
        date: "",
        "1": "唯一",
      },
    );
  });

  it("recognizes redirects of newly supported templates", () => {
    expect(
      extractIssueTemplates("{{AI-generated|reason=文章表現}}\n本文"),
    ).toContainEqual({
      name: "ai-generated",
      date: "",
      reason: "文章表現",
    });
  });
});
