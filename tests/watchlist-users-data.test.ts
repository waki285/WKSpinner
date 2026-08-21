import { describe, expect, it, vi } from "vitest";

import {
  calculateWatchlistExpiryDays,
  extractWatchedUserNames,
  fetchTagDisplayNames,
  fetchTagHelpPages,
  fetchUserContributions,
  fetchWatchedPageInfo,
  fetchWatchedUserNames,
  getNamespaceFilterIds,
  mergeContributions,
  type UserContribution,
} from "../src/watchlist-users-data";

function contribution(
  user: string,
  revid: number,
  timestamp: string,
): UserContribution {
  return {
    userid: revid,
    user,
    pageid: revid,
    revid,
    parentid: revid - 1,
    ns: 0,
    title: `記事${revid}`,
    timestamp,
  };
}

describe("watched user extraction", () => {
  it("deduplicates user and talk pages and maps subpages to their owner", () => {
    expect(
      extractWatchedUserNames([
        { ns: 2, title: "利用者:Example" },
        { ns: 3, title: "利用者‐会話:Example" },
        { ns: 2, title: "利用者:Example/sandbox" },
        { ns: 3, title: "利用者‐会話:Another_User/archive" },
        { ns: 0, title: "Example" },
      ]),
    ).toEqual(["Another User", "Example"]);
  });

  it("follows watchlist continuation before extracting users", async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        continue: { wrcontinue: "3|Example" },
        query: { watchlistraw: [{ ns: 2, title: "利用者:First" }] },
      })
      .mockResolvedValueOnce({
        query: { watchlistraw: [{ ns: 3, title: "利用者‐会話:Second" }] },
      });

    await expect(
      fetchWatchedUserNames({ get } as unknown as mw.Api),
    ).resolves.toEqual(["First", "Second"]);
    expect(get).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ wrcontinue: "3|Example" }),
    );
  });
});

describe("contribution aggregation", () => {
  it("merges batches in global timestamp order before applying the limit", () => {
    expect(
      mergeContributions(
        [
          [contribution("A", 1, "2026-08-20T10:00:00Z")],
          [
            contribution("B", 2, "2026-08-20T12:00:00Z"),
            contribution("B", 3, "2026-08-20T09:00:00Z"),
          ],
        ],
        2,
      ).map(({ revid }) => revid),
    ).toEqual([2, 1]);
  });

  it("queries more than 50 watched users in separate batches", async () => {
    const get = vi.fn(async (params: Record<string, unknown>) => ({
      query: {
        usercontribs: [
          contribution(
            String(params.ucuser).split("|")[0]!,
            String(params.ucuser).includes("User50") ? 2 : 1,
            String(params.ucuser).includes("User50")
              ? "2026-08-20T12:00:00Z"
              : "2026-08-20T10:00:00Z",
          ),
        ],
      },
    }));
    const users = Array.from({ length: 51 }, (_, index) => `User${index}`);

    const result = await fetchUserContributions(
      { get } as unknown as mw.Api,
      users,
      {
        days: 7,
        limit: 10,
        namespaceIds: [],
        minor: "all",
        bots: "all",
        now: new Date("2026-08-20T13:00:00Z"),
      },
    );

    expect(get).toHaveBeenCalledTimes(2);
    expect(result.map(({ revid }) => revid)).toEqual([2, 1]);
  });

  it("excludes the current user before requesting contributions", async () => {
    const get = vi.fn().mockResolvedValue({
      query: { usercontribs: [] },
    });

    await fetchUserContributions(
      { get } as unknown as mw.Api,
      ["Example", "CurrentUser", "Another"],
      {
        days: 7,
        limit: 250,
        namespaceIds: [],
        minor: "all",
        bots: "all",
        excludeUserName: "CurrentUser",
        now: new Date("2026-08-20T13:00:00Z"),
      },
    );

    expect(get).toHaveBeenCalledWith(
      expect.objectContaining({ ucuser: "Example|Another" }),
    );
  });
});

describe("watched contribution pages", () => {
  it("returns watched page IDs with their optional expiry", async () => {
    const get = vi.fn().mockResolvedValue({
      query: {
        pages: [
          {
            pageid: 10,
            watched: true,
            watchlistexpiry: "2026-08-27T12:00:00Z",
          },
          { pageid: 20 },
          { pageid: 30, watched: true },
        ],
      },
    });

    await expect(
      fetchWatchedPageInfo({ get } as unknown as mw.Api, [10, 20, 30, 10, 0]),
    ).resolves.toEqual(
      new Map([
        [10, "2026-08-27T12:00:00Z"],
        [30, null],
      ]),
    );
    expect(get).toHaveBeenCalledWith({
      action: "query",
      pageids: "10|20|30",
      prop: "info",
      inprop: "watched",
      formatversion: "2",
    });
  });

  it("queries page IDs in batches of 50", async () => {
    const get = vi.fn().mockResolvedValue({ query: { pages: [] } });

    await fetchWatchedPageInfo(
      { get } as unknown as mw.Api,
      Array.from({ length: 51 }, (_, index) => index + 1),
    );

    expect(get).toHaveBeenCalledTimes(2);
  });

  it("calculates expiry days with MediaWiki's whole-day behavior", () => {
    const now = new Date("2026-08-21T12:00:00Z");
    expect(calculateWatchlistExpiryDays("2026-08-23T11:59:59Z", now)).toBe(1);
    expect(calculateWatchlistExpiryDays("2026-08-22T11:59:59Z", now)).toBe(0);
  });
});

describe("tag display names", () => {
  it("follows continuation and omits tags without a public display name", async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        continue: { tgcontinue: "visualeditor" },
        query: {
          tags: [
            { name: "mobile edit", displayname: "モバイル編集" },
            { name: "hidden", displayname: false },
            { name: "empty", displayname: "" },
          ],
        },
      })
      .mockResolvedValueOnce({
        query: {
          tags: [
            {
              name: "visualeditor",
              displayname: "ビジュアルエディター",
            },
          ],
        },
      });

    await expect(
      fetchTagDisplayNames({ get } as unknown as mw.Api),
    ).resolves.toEqual(
      new Map([
        ["mobile edit", "モバイル編集"],
        ["visualeditor", "ビジュアルエディター"],
      ]),
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ tgcontinue: "visualeditor" }),
    );
  });

  it("loads configured help pages and ignores missing messages", async () => {
    const get = vi.fn().mockResolvedValue({
      query: {
        allmessages: [
          {
            name: "tag-visualeditor-helppage",
            content: "Project:ビジュアルエディター",
          },
          { name: "tag-mobile edit-helppage", missing: true },
        ],
      },
    });

    await expect(
      fetchTagHelpPages(
        { get } as unknown as mw.Api,
        ["visualeditor", "mobile edit"],
        "ja",
      ),
    ).resolves.toEqual(
      new Map([["visualeditor", "Project:ビジュアルエディター"]]),
    );
    expect(get).toHaveBeenCalledWith(
      expect.objectContaining({
        amlang: "ja",
        ammessages: "tag-visualeditor-helppage|tag-mobile edit-helppage",
        amenableparser: true,
      }),
    );
  });
});

describe("namespace filters", () => {
  const available = [0, 1, 2, 3, 4, 5];

  it("includes the associated namespace", () => {
    expect(getNamespaceFilterIds(2, false, true, available)).toEqual([2, 3]);
  });

  it("inverts both the selected and associated namespaces", () => {
    expect(getNamespaceFilterIds(2, true, true, available)).toEqual([
      0, 1, 4, 5,
    ]);
  });

  it("uses an empty list to represent all namespaces", () => {
    expect(getNamespaceFilterIds(null, true, true, available)).toEqual([]);
  });
});
