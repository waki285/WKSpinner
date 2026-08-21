import { describe, expect, it } from "vitest";

import { shouldLoadWKSpinner } from "../src/startup";

describe("WKSpinner startup guard", () => {
  it("disables a production script when nowksprod is 1", () => {
    expect(shouldLoadWKSpinner("?nowksprod=1", false)).toBe(false);
  });

  it("keeps a development script enabled", () => {
    expect(shouldLoadWKSpinner("?nowksprod=1", true)).toBe(true);
  });

  it("does not disable production for other values", () => {
    expect(shouldLoadWKSpinner("?nowksprod=0", false)).toBe(true);
  });

  it("detects the opt-out among repeated parameters", () => {
    expect(
      shouldLoadWKSpinner("?nowksprod=0&example=1&nowksprod=1", false),
    ).toBe(false);
  });
});
