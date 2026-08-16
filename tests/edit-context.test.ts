import { afterEach, describe, expect, it, vi } from "vitest";

import { getPageEditContext } from "../src/util";

function mockApiResponse(response: unknown) {
  const post = vi.fn().mockResolvedValue(response);
  class Api {
    post = post;
  }
  vi.stubGlobal("mw", { Api });
  return post;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getPageEditContext", () => {
  it("returns the server timestamp, revision ID, and requested content", async () => {
    const post = mockApiResponse({
      curtimestamp: "2026-08-15T01:02:03Z",
      query: {
        pages: [
          {
            pageid: 42,
            revisions: [
              {
                revid: 123,
                slots: { main: { content: "Current content" } },
              },
            ],
          },
        ],
      },
    });

    await expect(getPageEditContext("Example", true)).resolves.toEqual({
      startTimestamp: "2026-08-15T01:02:03Z",
      revisionId: 123,
      content: "Current content",
    });
    expect(post).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: "Example",
        curtimestamp: 1,
        rvprop: "ids|content",
        rvslots: "main",
      }),
    );
  });

  it("keeps the start timestamp when the page does not exist", async () => {
    mockApiResponse({
      curtimestamp: "2026-08-15T01:02:03Z",
      query: { pages: [{ title: "Missing", missing: true }] },
    });

    await expect(getPageEditContext("Missing")).resolves.toEqual({
      startTimestamp: "2026-08-15T01:02:03Z",
      revisionId: null,
      content: null,
    });
  });
});
