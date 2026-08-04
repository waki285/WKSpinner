import { describe, expect, it } from "vitest";

import { getJapaneseDescription } from "../src/modules/wikidata";

describe("getJapaneseDescription", () => {
  it("returns the Japanese Wikidata description", () => {
    expect(
      getJapaneseDescription(
        {
          entities: {
            Q42: {
              descriptions: {
                ja: { language: "ja", value: " イングランドの作家 " },
              },
            },
          },
        },
        "Q42",
      ),
    ).toBe("イングランドの作家");
  });

  it("returns null when a Japanese description is unavailable", () => {
    expect(
      getJapaneseDescription(
        {
          entities: {
            Q42: {
              descriptions: {
                en: { language: "en", value: "English writer" },
              },
            },
          },
        },
        "Q42",
      ),
    ).toBeNull();
  });
});
