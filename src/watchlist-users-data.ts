export type WatchedTitle = {
  ns: number;
  title: string;
};

export type UserContribution = {
  userid: number;
  user: string;
  pageid: number;
  revid: number;
  parentid: number;
  ns: number;
  title: string;
  timestamp: string;
  comment?: string;
  parsedcomment?: string;
  sizediff?: number;
  tags?: string[];
  new?: boolean;
  minor?: boolean;
  top?: boolean;
  commenthidden?: boolean;
};

export type ContributionFilterMode = "all" | "hide" | "only";

export type ContributionFilters = {
  days: number;
  limit: number;
  namespaceIds: number[];
  minor: ContributionFilterMode;
  bots: ContributionFilterMode;
  excludeUserName?: string;
  now?: Date;
};

type WatchlistRawResponse = {
  continue?: { wrcontinue?: string };
  query?: { watchlistraw?: WatchedTitle[] };
  watchlistraw?: WatchedTitle[];
};

type UsersResponse = {
  query?: {
    users?: { name: string; groups?: string[] }[];
  };
};

type UserContribsResponse = {
  query?: { usercontribs?: UserContribution[] };
};

type PageInfoResponse = {
  query?: {
    pages?: {
      title: string;
      missing?: boolean;
      watched?: boolean;
      watchlistexpiry?: string;
    }[];
  };
};

export type ContributionPageInfo = {
  missing: boolean;
  watched: boolean;
  watchlistExpiry: string | null;
};

type TagsResponse = {
  continue?: { tgcontinue?: string };
  query?: {
    tags?: { name: string; displayname?: string | false }[];
  };
};

type AllMessagesResponse = {
  query?: {
    allmessages?: {
      name: string;
      normalizedname?: string;
      content?: string;
      missing?: boolean;
    }[];
  };
};

function chunks<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

export function extractWatchedUserNames(titles: readonly WatchedTitle[]) {
  const names = new Set<string>();
  for (const { ns, title } of titles) {
    if (ns !== 2 && ns !== 3) {
      continue;
    }
    const separatorIndex = title.indexOf(":");
    const namespacedTitle =
      separatorIndex === -1 ? title : title.slice(separatorIndex + 1);
    const userName = namespacedTitle.split("/", 1)[0]?.trim();
    if (userName) {
      names.add(userName.replaceAll("_", " "));
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, "ja"));
}

export function mergeContributions(
  groups: readonly (readonly UserContribution[])[],
  limit: number,
) {
  return groups
    .flat()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

export async function fetchWatchedUserNames(api: mw.Api) {
  const titles: WatchedTitle[] = [];
  let wrcontinue: string | undefined;

  do {
    const response = (await api.get({
      action: "query",
      list: "watchlistraw",
      wrnamespace: "2|3",
      wrlimit: "max",
      formatversion: "2",
      ...(wrcontinue ? { wrcontinue } : {}),
    })) as WatchlistRawResponse;
    titles.push(
      ...(response.query?.watchlistraw ?? response.watchlistraw ?? []),
    );
    wrcontinue = response.continue?.wrcontinue;
  } while (wrcontinue);

  return extractWatchedUserNames(titles);
}

async function fetchBotNames(api: mw.Api, userNames: readonly string[]) {
  const botNames = new Set<string>();
  for (const batch of chunks(userNames, 50)) {
    const response = (await api.get({
      action: "query",
      list: "users",
      ususers: batch.join("|"),
      usprop: "groups",
      formatversion: "2",
    })) as UsersResponse;
    for (const user of response.query?.users ?? []) {
      if (user.groups?.includes("bot")) {
        botNames.add(user.name);
      }
    }
  }
  return botNames;
}

async function filterUsersByBotMode(
  api: mw.Api,
  userNames: readonly string[],
  mode: ContributionFilterMode,
) {
  if (mode === "all") {
    return [...userNames];
  }
  const botNames = await fetchBotNames(api, userNames);
  return userNames.filter((name) =>
    mode === "only" ? botNames.has(name) : !botNames.has(name),
  );
}

export async function fetchUserContributions(
  api: mw.Api,
  watchedUserNames: readonly string[],
  filters: ContributionFilters,
) {
  const filteredUserNames = await filterUsersByBotMode(
    api,
    watchedUserNames,
    filters.bots,
  );
  const userNames = filters.excludeUserName
    ? filteredUserNames.filter((name) => name !== filters.excludeUserName)
    : filteredUserNames;
  if (!userNames.length) {
    return [];
  }

  const start = filters.now ?? new Date();
  const end = new Date(start.getTime() - filters.days * 86_400_000);
  const show =
    filters.minor === "hide"
      ? "!minor"
      : filters.minor === "only"
        ? "minor"
        : undefined;

  const groups = await Promise.all(
    chunks(userNames, 50).map(async (batch) => {
      const response = (await api.get({
        action: "query",
        list: "usercontribs",
        ucuser: batch.join("|"),
        ucdir: "older",
        ucstart: start.toISOString(),
        ucend: end.toISOString(),
        uclimit: filters.limit,
        ucprop: "ids|title|timestamp|comment|parsedcomment|flags|sizediff|tags",
        formatversion: "2",
        ...(filters.namespaceIds.length
          ? { ucnamespace: filters.namespaceIds.join("|") }
          : {}),
        ...(show ? { ucshow: show } : {}),
      })) as UserContribsResponse;
      return response.query?.usercontribs ?? [];
    }),
  );

  return mergeContributions(groups, filters.limit);
}

export function calculateWatchlistExpiryDays(expiry: string, now = new Date()) {
  const remainingDays =
    (new Date(expiry).getTime() - now.getTime()) / 86_400_000;
  return remainingDays < 1 ? 0 : Math.floor(remainingDays);
}

export async function fetchContributionPageInfo(
  api: mw.Api,
  pageTitles: readonly string[],
) {
  const uniquePageTitles = [
    ...new Set(pageTitles.map((title) => title.trim()).filter(Boolean)),
  ];
  const responses = await Promise.all(
    chunks(uniquePageTitles, 50).map(
      async (batch) =>
        (await api.get({
          action: "query",
          titles: batch.join("|"),
          prop: "info",
          inprop: "watched",
          formatversion: "2",
        })) as PageInfoResponse,
    ),
  );
  const pageInfo = new Map<string, ContributionPageInfo>();
  for (const response of responses) {
    for (const page of response.query?.pages ?? []) {
      pageInfo.set(page.title, {
        missing: page.missing === true,
        watched: page.watched === true,
        watchlistExpiry: page.watchlistexpiry ?? null,
      });
    }
  }
  return pageInfo;
}

export async function fetchTagDisplayNames(api: mw.Api) {
  const displayNames = new Map<string, string>();
  let tgcontinue: string | undefined;

  do {
    const response = (await api.get({
      action: "query",
      list: "tags",
      tgprop: "displayname",
      tglimit: "max",
      formatversion: "2",
      ...(tgcontinue ? { tgcontinue } : {}),
    })) as TagsResponse;
    for (const tag of response.query?.tags ?? []) {
      if (
        typeof tag.displayname === "string" &&
        tag.displayname.trim() !== ""
      ) {
        displayNames.set(tag.name, tag.displayname);
      }
    }
    tgcontinue = response.continue?.tgcontinue;
  } while (tgcontinue);

  return displayNames;
}

export async function fetchTagHelpPages(
  api: mw.Api,
  tagNames: readonly string[],
  contentLanguage: string,
) {
  const helpPages = new Map<string, string>();
  const uniqueTagNames = [...new Set(tagNames.filter(Boolean))];

  for (const batch of chunks(uniqueTagNames, 50)) {
    const messageNames = batch.map((tag) => `tag-${tag}-helppage`);
    const tagsByMessageName = new Map(
      messageNames.map((messageName, index) => [
        messageName.toLowerCase(),
        batch[index]!,
      ]),
    );
    const response = (await api.get({
      action: "query",
      meta: "allmessages",
      ammessages: messageNames.join("|"),
      amlang: contentLanguage,
      amenableparser: true,
      formatversion: "2",
    })) as AllMessagesResponse;

    for (const message of response.query?.allmessages ?? []) {
      if (message.missing || !message.content?.trim()) {
        continue;
      }
      const tag =
        tagsByMessageName.get(message.name.toLowerCase()) ??
        (message.normalizedname
          ? tagsByMessageName.get(
              message.normalizedname.replaceAll("_", " ").toLowerCase(),
            )
          : undefined);
      if (tag) {
        helpPages.set(tag, message.content.trim());
      }
    }
  }

  return helpPages;
}

export function getNamespaceFilterIds(
  selectedNamespace: number | null,
  invert: boolean,
  includeAssociated: boolean,
  availableNamespaces: readonly number[],
) {
  if (selectedNamespace === null) {
    return [];
  }

  const selected = new Set([selectedNamespace]);
  if (includeAssociated) {
    selected.add(
      selectedNamespace % 2 === 0
        ? selectedNamespace + 1
        : selectedNamespace - 1,
    );
  }
  return invert
    ? availableNamespaces.filter((namespace) => !selected.has(namespace))
    : [...selected].filter((namespace) =>
        availableNamespaces.includes(namespace),
      );
}
