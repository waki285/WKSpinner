import { describe, expect, it } from "vitest";

import {
  validateCoreBundle,
  validateReleaseSource,
} from "../release-check.mjs";

const validConstants = `export const DEV = false;
export const VERSION = "1.2.3";`;

describe("validateReleaseSource", () => {
  it("accepts matching production metadata", () => {
    expect(
      validateReleaseSource('{"version":"1.2.3"}', validConstants),
    ).toEqual({ version: "1.2.3", errors: [] });
  });

  it("rejects a development release", () => {
    const result = validateReleaseSource(
      '{"version":"1.2.3"}',
      validConstants.replace("false", "true"),
    );
    expect(result.errors).toContain("DEV must be false for a release build.");
  });

  it("rejects mismatched versions", () => {
    const result = validateReleaseSource('{"version":"1.2.4"}', validConstants);
    expect(result.errors).toContain(
      "Version mismatch: package.json=1.2.4, src/constants.ts=1.2.3.",
    );
  });

  it("rejects invalid package metadata", () => {
    const result = validateReleaseSource("not json", validConstants);
    expect(result.version).toBeNull();
    expect(result.errors[0]).toMatch(/^package\.json could not be parsed:/u);
  });
});

describe("validateCoreBundle", () => {
  it("accepts a release bundle", () => {
    expect(validateCoreBundle("// @version 1.2.3\ncode", "1.2.3")).toEqual([]);
  });

  it("rejects a stale or development bundle", () => {
    const errors = validateCoreBundle(
      "// @version 1.2.2\n//# sourceMappingURL=data:application/json;base64,test",
      "1.2.3",
    );
    expect(errors).toEqual([
      "dist/index.js does not contain release version 1.2.3.",
      "dist/index.js contains an inline source map.",
    ]);
  });
});
