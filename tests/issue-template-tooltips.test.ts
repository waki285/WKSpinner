import { describe, expect, it } from "vitest";

import { ALL_ISSUE_CHOICES } from "../src/constants";
import { ISSUE_TEMPLATE_TOOLTIP_TEXTS } from "../src/issue-template-tooltips";

describe("issue template tooltips", () => {
  it("defines visible text for every issue template choice", () => {
    expect(Object.keys(ISSUE_TEMPLATE_TOOLTIP_TEXTS).sort()).toEqual(
      ALL_ISSUE_CHOICES.map(({ id }) => id).sort(),
    );
    for (const text of Object.values(ISSUE_TEMPLATE_TOOLTIP_TEXTS)) {
      expect(text.trim().length).toBeGreaterThan(10);
    }
  });
});
