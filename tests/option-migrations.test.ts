import { describe, expect, it } from "vitest";

import { applyOptionMigrations } from "../src/option-migrations";

describe("applyOptionMigrations", () => {
  it("migrates the legacy MI summary format before 0.11.1", () => {
    const settings = { mi: { default: { summary: "+$t" } } };

    expect(applyOptionMigrations(settings, "0.11.0")).toBe(true);
    expect(settings.mi.default.summary).toBe("+{{$t}}");
  });

  it("does not overwrite a custom MI summary format", () => {
    const settings = { mi: { default: { summary: "+{{$s1}}" } } };

    expect(applyOptionMigrations(settings, "0.11.0")).toBe(false);
    expect(settings.mi.default.summary).toBe("+{{$s1}}");
  });

  it("does not rerun the MI migration on 0.11.1", () => {
    const settings = { mi: { default: { summary: "+$t" } } };

    expect(applyOptionMigrations(settings, "0.11.1")).toBe(false);
    expect(settings.mi.default.summary).toBe("+$t");
  });

  it("applies older migrations in the same pass", () => {
    const settings = {
      rfp: { default: { summarySubmit: "保護依頼" } },
      warn: { default: { summary: "$t" } },
      mi: { default: { summary: "+$t" } },
    };

    expect(applyOptionMigrations(settings, "0.10.5")).toBe(true);
    expect(settings).toEqual({
      rfp: { default: { summarySubmit: "+$p" } },
      warn: { default: { summary: "+{{$t}}" } },
      mi: { default: { summary: "+{{$t}}" } },
    });
  });
});
