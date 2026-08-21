import { WATCHLIST_USERS_PAGE_NAME } from "./constants";
import WATCHLIST_USERS_STYLE from "./styles/watchlist-users.css";
import {
  calculateWatchlistExpiryDays,
  fetchTagDisplayNames,
  fetchTagHelpPages,
  fetchUserContributions,
  fetchWatchedPageInfo,
  fetchWatchedUserNames,
  getNamespaceFilterIds,
  type ContributionFilterMode,
  type UserContribution,
} from "./watchlist-users-data";

type ViewOptions = {
  days: number;
  limit: number;
  namespace: number | null;
  invert: boolean;
  associated: boolean;
  hideSelf: boolean;
  minor: ContributionFilterMode;
  bots: ContributionFilterMode;
};

type ContributionRenderContext = {
  api: mw.Api;
  canRollback: boolean;
  watchedPages: ReadonlyMap<number, string | null>;
  tagDisplayNames: ReadonlyMap<string, string>;
  tagHelpPages: ReadonlyMap<string, string>;
};

const VALID_DAYS = [1, 3, 7, 14, 30] as const;
const VALID_LIMITS = [50, 100, 250, 500] as const;
const FILTER_MODES: readonly ContributionFilterMode[] = ["all", "hide", "only"];

function parseListedNumber(
  value: string | null,
  allowed: readonly number[],
  fallback: number,
) {
  const parsed = Number(value);
  return allowed.includes(parsed) ? parsed : fallback;
}

function getAvailableNamespaces() {
  const formatted = mw.config.get("wgFormattedNamespaces") as Record<
    string,
    string
  >;
  return Object.entries(formatted)
    .map(([id, name]) => ({ id: Number(id), name: name || "標準" }))
    .filter(({ id }) => Number.isInteger(id) && id >= 0)
    .sort((a, b) => a.id - b.id);
}

function getDefaultMode(optionName: string): ContributionFilterMode {
  return Number(mw.user.options.get(optionName)) === 1 ? "hide" : "all";
}

function getViewOptions(
  params: URLSearchParams,
  availableNamespaceIds: readonly number[],
): ViewOptions {
  const namespaceValue = params.get("namespace");
  const parsedNamespace =
    namespaceValue === null ? null : Number(namespaceValue);
  const namespace =
    parsedNamespace !== null && availableNamespaceIds.includes(parsedNamespace)
      ? parsedNamespace
      : null;
  const minor = params.get("minor") as ContributionFilterMode | null;
  const bots = params.get("bots") as ContributionFilterMode | null;

  return {
    days: parseListedNumber(
      params.get("days"),
      VALID_DAYS,
      parseListedNumber(
        String(mw.user.options.get("watchlistdays") ?? ""),
        VALID_DAYS,
        7,
      ),
    ),
    limit: parseListedNumber(
      params.get("limit"),
      VALID_LIMITS,
      parseListedNumber(
        String(mw.user.options.get("wllimit") ?? ""),
        VALID_LIMITS,
        250,
      ),
    ),
    namespace,
    invert: params.get("invert") === "1",
    associated: params.get("associated") === "1",
    hideSelf: params.get("hideself") !== "0",
    minor:
      minor && FILTER_MODES.includes(minor)
        ? minor
        : getDefaultMode("watchlisthideminor"),
    bots:
      bots && FILTER_MODES.includes(bots)
        ? bots
        : getDefaultMode("watchlisthidebots"),
  };
}

function addSelectOption(
  select: JQuery<HTMLSelectElement>,
  value: string | number,
  label: string,
  selected: boolean,
) {
  select.append(
    $("<option>").prop({
      value: String(value),
      text: label,
      selected,
    }),
  );
}

function createSelectField(
  id: string,
  name: string,
  label: string,
  options: readonly { value: string | number; label: string }[],
  selectedValue: string | number,
) {
  const select = $(document.createElement("select")).prop({ id, name });
  for (const option of options) {
    addSelectOption(
      select,
      option.value,
      option.label,
      String(option.value) === String(selectedValue),
    );
  }
  return $("<div>")
    .addClass("wks-watchlist-users-field")
    .append($("<label>").prop("for", id).text(label), select);
}

function createCheck(
  id: string,
  name: string,
  label: string,
  checked: boolean,
) {
  const input = $("<input>").prop({
    id,
    name,
    type: "checkbox",
    value: "1",
    checked,
  });
  return $("<label>")
    .addClass("wks-watchlist-users-check")
    .append(input, $("<span>").text(label));
}

function createFilterForm(
  options: ViewOptions,
  namespaces: readonly { id: number; name: string }[],
) {
  const form = $(document.createElement("form"))
    .addClass("wks-watchlist-users-filters")
    .prop({ method: "get", action: mw.util.getUrl(WATCHLIST_USERS_PAGE_NAME) });
  const filterHeader = $("<div>").addClass("wks-watchlist-users-filter-header");
  const hideButton = $("<button>")
    .prop({ type: "button" })
    .attr("aria-expanded", "true")
    .addClass("wks-watchlist-users-filter-hide")
    .text("非表示");
  filterHeader.append($("<strong>").text("絞り込み"), hideButton);
  const filterContent = $("<div>").addClass(
    "wks-watchlist-users-filter-content",
  );
  const chips = $("<div>").addClass("wks-watchlist-users-filter-chips");
  const details = $(document.createElement("details")).addClass(
    "wks-watchlist-users-filter-details",
  );
  const settingsSummary = $("<span>").addClass(
    "wks-watchlist-users-filter-settings-summary",
  );
  details.append(
    $("<summary>").append(
      $("<span>")
        .addClass("wks-watchlist-users-filter-menu-icon")
        .attr("aria-hidden", "true")
        .text("☰"),
      $("<span>").text("絞り込みを行う"),
      $("<span>")
        .addClass("wks-watchlist-users-filter-hint")
        .text("（条件を選択）"),
      settingsSummary,
    ),
  );
  const panel = $("<div>").addClass("wks-watchlist-users-filter-panel");
  const grid = $("<div>").addClass("wks-watchlist-users-filter-grid");

  grid.append(
    createSelectField(
      "wks-watchlist-users-days",
      "days",
      "期間",
      VALID_DAYS.map((days) => ({ value: days, label: `過去${days}日` })),
      options.days,
    ),
    createSelectField(
      "wks-watchlist-users-limit",
      "limit",
      "表示件数",
      VALID_LIMITS.map((limit) => ({ value: limit, label: `${limit}件` })),
      options.limit,
    ),
  );

  const namespaceSelect = $(document.createElement("select")).prop({
    id: "wks-watchlist-users-namespace",
    name: "namespace",
  });
  addSelectOption(namespaceSelect, "all", "すべて", options.namespace === null);
  for (const namespace of namespaces) {
    addSelectOption(
      namespaceSelect,
      namespace.id,
      namespace.name,
      options.namespace === namespace.id,
    );
  }
  const invert = createCheck(
    "wks-watchlist-users-invert",
    "invert",
    "選択した名前空間を除外",
    options.invert,
  );
  const associated = createCheck(
    "wks-watchlist-users-associated",
    "associated",
    "付随する名前空間を含める",
    options.associated,
  );
  const namespaceOptions = $("<div>")
    .addClass("wks-watchlist-users-namespace-options")
    .append(invert, associated);
  const namespaceField = $("<div>")
    .addClass("wks-watchlist-users-field")
    .append(
      $("<label>")
        .prop("for", "wks-watchlist-users-namespace")
        .text("名前空間"),
      namespaceSelect,
      namespaceOptions,
    );
  const updateNamespaceOptions = () => {
    const disabled = namespaceSelect.val() === "all";
    invert.find("input").prop("disabled", disabled);
    associated.find("input").prop("disabled", disabled);
  };
  namespaceSelect.on("change", updateNamespaceOptions);
  updateNamespaceOptions();
  grid.append(namespaceField);

  const modeOptions = [
    { value: "all", label: "すべて" },
    { value: "hide", label: "表示しない" },
    { value: "only", label: "のみ" },
  ];
  grid.append(
    createSelectField(
      "wks-watchlist-users-minor",
      "minor",
      "細部編集",
      modeOptions,
      options.minor,
    ),
    createSelectField(
      "wks-watchlist-users-bots",
      "bots",
      "ボットによる編集",
      modeOptions,
      options.bots,
    ),
    $("<div>")
      .addClass("wks-watchlist-users-field")
      .append(
        $("<span>").addClass("wks-watchlist-users-field-label").text("利用者"),
        createCheck(
          "wks-watchlist-users-hide-self",
          "hideself",
          "自分の編集を表示しない",
          options.hideSelf,
        ),
      ),
  );

  const submit = $("<button>")
    .prop({ type: "submit" })
    .addClass("wks-watchlist-users-submit")
    .text("表示");
  const reset = $("<a>")
    .prop("href", mw.util.getUrl(WATCHLIST_USERS_PAGE_NAME))
    .text("既定値に戻す");
  panel.append(
    grid,
    $("<div>").addClass("wks-watchlist-users-actions").append(submit, reset),
  );
  details.append(panel);
  filterContent.append(chips, details);
  form.append(filterHeader, filterContent);

  hideButton.on("click", () => {
    const hidden = !filterContent.prop("hidden");
    filterContent.prop("hidden", hidden);
    hideButton
      .attr("aria-expanded", String(!hidden))
      .text(hidden ? "表示" : "非表示");
  });

  const addChip = (label: string, onRemove: () => void) => {
    chips.append(
      $("<button>")
        .prop({ type: "button" })
        .addClass("wks-watchlist-users-filter-chip")
        .attr("aria-label", `${label}を解除`)
        .append(
          $("<span>").text(label),
          $("<span>")
            .addClass("wks-watchlist-users-filter-chip-remove")
            .attr("aria-hidden", "true")
            .text("×"),
        )
        .on("click", () => {
          onRemove();
          form.trigger("submit");
        }),
    );
  };

  const updateFilterSummary = (current: ViewOptions) => {
    chips.empty();
    if (current.hideSelf) {
      addChip("自分の編集を除外", () => {
        form.find<HTMLInputElement>("[name=hideself]").prop("checked", false);
      });
    }
    if (current.bots === "hide") {
      addChip("人間（ボットではない）", () => {
        form.find<HTMLSelectElement>("[name=bots]").val("all");
      });
    } else if (current.bots === "only") {
      addChip("ボット", () => {
        form.find<HTMLSelectElement>("[name=bots]").val("all");
      });
    }
    if (current.minor === "hide") {
      addChip("細部編集を除外", () => {
        form.find<HTMLSelectElement>("[name=minor]").val("all");
      });
    } else if (current.minor === "only") {
      addChip("細部編集", () => {
        form.find<HTMLSelectElement>("[name=minor]").val("all");
      });
    }
    if (current.namespace !== null) {
      const namespaceName =
        namespaces.find(({ id }) => id === current.namespace)?.name ??
        String(current.namespace);
      const namespaceLabel = current.invert
        ? `${namespaceName}を除外`
        : current.associated
          ? `${namespaceName}と付随名前空間`
          : namespaceName;
      addChip(`名前空間: ${namespaceLabel}`, () => {
        namespaceSelect.val("all").trigger("change");
        invert.find("input").prop("checked", false);
        associated.find("input").prop("checked", false);
      });
    }
    if (!chips.children().length) {
      chips.append(
        $("<span>")
          .addClass("wks-watchlist-users-filter-chip-static")
          .text("すべての編集"),
      );
    }
    settingsSummary.text(`⚙ 過去${current.days}日の${current.limit}件の変更`);
  };

  updateFilterSummary(options);
  return { form, submit, details, updateFilterSummary };
}

function getOffsetMinutes() {
  const timeCorrection = String(mw.user.options.get("timecorrection") ?? "");
  const offset = Number(timeCorrection.split("|")[1]);
  return Number.isFinite(offset) ? offset : 0;
}

function getDisplayDate(timestamp: string) {
  return new Date(new Date(timestamp).getTime() + getOffsetMinutes() * 60_000);
}

function getDateKey(timestamp: string) {
  return getDisplayDate(timestamp).toISOString().slice(0, 10);
}

function formatDate(timestamp: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(getDisplayDate(timestamp));
}

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(getDisplayDate(timestamp));
}

function createLink(
  label: string,
  title: string,
  params?: Record<string, string | number | boolean | null | undefined>,
) {
  return $("<a>").prop("href", mw.util.getUrl(title, params)).text(label);
}

function createFlags(contribution: UserContribution) {
  const flags = $("<span>").addClass("wks-watchlist-users-flags");
  if (contribution.new) {
    flags.append($("<abbr>").prop("title", "新規ページ").text("N"));
  }
  if (contribution.minor) {
    flags.append($("<abbr>").prop("title", "細部の編集").text("m"));
  }
  return flags;
}

function createSizeDifference(sizediff?: number) {
  const value = sizediff ?? 0;
  const formattedValue = Math.abs(value).toLocaleString("ja-JP");
  const signedValue = value > 0 ? `+${formattedValue}` : `-${formattedValue}`;
  const size = $("<span>")
    .addClass("wks-watchlist-users-size mw-diff-bytes")
    .prop("title", "変更したバイト数")
    .text(value === 0 ? "0" : signedValue);
  if (value > 0) {
    size.addClass("mw-plusminus-pos");
  } else if (value < 0) {
    size.addClass("mw-plusminus-neg");
  } else {
    size.addClass("mw-plusminus-null");
  }
  if (Math.abs(value) > 500) {
    size.addClass("wks-watchlist-users-size-large");
  }
  return size;
}

function createWatchlistExpiryIcon(expiry: string) {
  const daysLeft = calculateWatchlistExpiryDays(expiry);
  const titleMessage = mw.message(
    daysLeft < 1
      ? "watchlist-expiring-hours-full-text"
      : "watchlist-expiring-days-full-text",
    daysLeft,
  );
  const ariaMessage = mw.message("watchlist-expires-in-aria-label");
  const widget = new OO.ui.IconWidget({
    icon: "clock",
    title: titleMessage.exists()
      ? titleMessage.text()
      : daysLeft < 1
        ? "ウォッチ期間の残りは数時間です"
        : `ウォッチ期間の残りは${daysLeft}日です`,
    classes: ["mw-changesList-watchlistExpiry"],
  });
  widget.$element.attr({
    role: "img",
    "aria-label": ariaMessage.exists()
      ? ariaMessage.text()
      : "期限付きウォッチ",
    "data-days-left": daysLeft,
  });
  return widget.$element;
}

function getTagHelpHref(helpPage: string) {
  return /^(?:https?:)?\/\//i.test(helpPage) || helpPage.startsWith("/")
    ? helpPage
    : mw.util.getUrl(helpPage);
}

function createTagMarker(displayName: string, helpPage: string | undefined) {
  const parsedDisplayName = $("<span>").html(displayName);
  if (!parsedDisplayName.text().trim()) {
    return null;
  }

  const marker = $("<span>").addClass("mw-tag-marker");
  const displayContents = parsedDisplayName.contents();
  if (parsedDisplayName.find("a").length || !helpPage) {
    return marker.append(displayContents);
  }
  return marker.append(
    $("<a>").prop("href", getTagHelpHref(helpPage)).append(displayContents),
  );
}

function createContributionActions(
  contribution: UserContribution,
  context: ContributionRenderContext,
) {
  const currentUser = mw.user.getName();
  if (!currentUser || currentUser === contribution.user) {
    return null;
  }

  const actions = $("<span>").addClass("wks-watchlist-users-entry-actions");
  let hasAction = false;
  if (contribution.top && context.canRollback) {
    const rollback = $("<a>")
      .prop("href", "#")
      .addClass("mw-rollback-link")
      .text("巻き戻し")
      .on("click", async (event) => {
        event.preventDefault();
        if (
          !window.confirm(
            `${contribution.title}の${contribution.user}による連続編集を巻き戻しますか？`,
          )
        ) {
          return;
        }
        rollback.attr("aria-disabled", "true").text("巻き戻し中…");
        try {
          await context.api.postWithToken("rollback", {
            action: "rollback",
            title: contribution.title,
            user: contribution.user,
            formatversion: "2",
          });
          mw.notify("巻き戻しに成功しました。");
          window.location.reload();
        } catch (error) {
          rollback.removeAttr("aria-disabled").text("巻き戻し");
          mw.notify(`巻き戻しに失敗しました: ${getErrorMessage(error)}`, {
            type: "error",
          });
        }
      });
    actions.append(rollback);
    hasAction = true;
  }

  const thanks = createLink(
    "感謝",
    `Special:Thanks/${contribution.revid}`,
  ).addClass("mw-thanks-thank-link");
  if (hasAction) {
    actions.append(" | ");
  }
  actions.append(thanks);
  return actions;
}

function createContributionEntry(
  contribution: UserContribution,
  context: ContributionRenderContext,
) {
  const entry = $("<li>").addClass(
    "wks-watchlist-users-entry mw-changeslist-line mw-changeslist-edit",
  );
  if (context.watchedPages.has(contribution.pageid)) {
    entry.addClass("mw-changeslist-line-watched");
  }
  const links = $("<span>")
    .addClass("wks-watchlist-users-links")
    .append(
      "(",
      createLink("差分", contribution.title, {
        diff: contribution.revid,
        oldid: contribution.parentid || "prev",
      }),
      " | ",
      createLink("履歴", contribution.title, { action: "history" }),
      ")",
    );
  const title = createLink(contribution.title, contribution.title).addClass(
    "mw-changeslist-title",
  );
  const titleContainer = $("<span>").addClass("mw-title").append(title);
  const watchlistExpiry = context.watchedPages.get(contribution.pageid);
  const userNamespace = String(
    (mw.config.get("wgFormattedNamespaces") as Record<string, string>)["2"] ??
      "利用者",
  );
  const userTalkNamespace = String(
    (mw.config.get("wgFormattedNamespaces") as Record<string, string>)["3"] ??
      "利用者‐会話",
  );
  const user = createLink(
    contribution.user,
    `${userNamespace}:${contribution.user}`,
  ).addClass("mw-userlink");
  const userLinks = $("<span>")
    .addClass("wks-watchlist-users-user")
    .append(
      user,
      " (",
      createLink("会話", `${userTalkNamespace}:${contribution.user}`),
      " | ",
      createLink("投稿記録", `Special:Contributions/${contribution.user}`),
      ")",
    );

  entry.append(
    links,
    " ",
    $("<span>").addClass("mw-changeslist-separator"),
    " ",
    createFlags(contribution),
    titleContainer,
  );
  if (watchlistExpiry) {
    entry.append(
      " ",
      createWatchlistExpiryIcon(watchlistExpiry),
      " ",
      $("<span>").addClass("mw-changeslist-separator"),
    );
  } else {
    entry.append($("<span>").addClass("mw-changeslist-separator--semicolon"));
  }
  entry.append(
    " ",
    $("<span>")
      .addClass("wks-watchlist-users-time")
      .text(formatTime(contribution.timestamp)),
    " ",
    $("<span>").addClass("mw-changeslist-separator"),
    " ",
    createSizeDifference(contribution.sizediff),
    " ",
    $("<span>").addClass("mw-changeslist-separator"),
    " ",
    userLinks,
  );

  if (contribution.commenthidden) {
    entry.append(
      " ",
      $("<span>")
        .addClass("comment wks-watchlist-users-comment")
        .text("(編集要約は非公開です)"),
    );
  } else if (contribution.parsedcomment?.trim()) {
    entry.append(
      " (",
      $("<span>")
        .addClass("comment wks-watchlist-users-comment")
        .html(contribution.parsedcomment),
      ")",
    );
  } else if (contribution.comment?.trim()) {
    entry.append(
      " ",
      $("<span>")
        .addClass("comment wks-watchlist-users-comment")
        .text(`(${contribution.comment.trim()})`),
    );
  }

  if (contribution.top) {
    entry.append(" ", $("<strong>").text("(最新)"));
  }
  const actions = createContributionActions(contribution, context);
  if (actions) {
    entry.append(" (", actions, ")");
  }
  if (contribution.tags?.length) {
    const markers = contribution.tags.flatMap((tag) => {
      const displayName = context.tagDisplayNames.get(tag);
      if (!displayName) {
        return [];
      }
      const marker = createTagMarker(
        displayName,
        context.tagHelpPages.get(tag),
      );
      return marker ? [marker] : [];
    });
    if (markers.length) {
      const tags = $("<span>")
        .addClass("wks-watchlist-users-tags mw-tag-markers")
        .append(createLink("タグ", "Special:Tags"), ": ");
      markers.forEach((marker, index) => {
        if (index) {
          tags.append(" ");
        }
        tags.append(marker);
      });
      entry.append(" ", tags);
    }
  }
  return entry;
}

function renderContributions(
  holder: JQuery<HTMLElement>,
  contributions: readonly UserContribution[],
  context: ContributionRenderContext,
) {
  holder.empty();
  let currentDate = "";
  let list: JQuery<HTMLUListElement> | null = null;
  for (const contribution of contributions) {
    const date = getDateKey(contribution.timestamp);
    if (date !== currentDate) {
      currentDate = date;
      holder.append(
        $("<h2>")
          .addClass("wks-watchlist-users-date")
          .text(formatDate(contribution.timestamp)),
      );
      const nextList = $(document.createElement("ul")).addClass(
        "wks-watchlist-users-list mw-changeslist",
      );
      list = nextList;
      holder.append(nextList);
    }
    list?.append(createContributionEntry(contribution, context));
  }
  mw.hook("wikipage.content").fire(holder);
}

function renderSkeleton(holder: JQuery<HTMLElement>) {
  const skeleton = $("<ul>")
    .addClass("wks-watchlist-users-skeleton")
    .prop("aria-hidden", true);
  for (let index = 0; index < 6; index += 1) {
    skeleton.append($("<li>"));
  }
  holder.empty().append(skeleton);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error === "notloggedin"
      ? "ウォッチリストを取得するにはログインが必要です。"
      : error;
  }
  return "データの取得中にエラーが発生しました。";
}

function updateUrl(options: ViewOptions) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();
  params.set("days", String(options.days));
  params.set("limit", String(options.limit));
  if (options.namespace !== null) {
    params.set("namespace", String(options.namespace));
  }
  if (options.invert) {
    params.set("invert", "1");
  }
  if (options.associated) {
    params.set("associated", "1");
  }
  if (!options.hideSelf) {
    params.set("hideself", "0");
  }
  params.set("minor", options.minor);
  params.set("bots", options.bots);
  url.search = params.toString();
  window.history.replaceState(null, "", url);
}

export async function showWatchlistUsersPage() {
  await mw.loader.using([
    "mediawiki.interface.helpers.styles",
    "mediawiki.special.changeslist",
    "mediawiki.special.changeslist.watchlistexpiry",
    "oojs-ui-core",
  ]);
  mw.loader.addStyleTag(WATCHLIST_USERS_STYLE);
  const namespaces = getAvailableNamespaces();
  const namespaceIds = namespaces.map(({ id }) => id);
  const initialOptions = getViewOptions(
    new URLSearchParams(window.location.search),
    namespaceIds,
  );

  const heading = document.getElementById("firstHeading");
  if (heading) {
    heading.textContent = "ウォッチしている利用者の投稿記録";
  }
  document.title = `ウォッチしている利用者の投稿記録 - ${mw.config.get("wgSiteName")}`;
  const content = document.getElementById("mw-content-text");
  if (!content) {
    console.warn("WKSpinner: コンテンツ領域が見つかりません");
    return;
  }

  const root = $("<div>").addClass("wks-watchlist-users");
  const description = $("<p>").text(
    "ウォッチリストに登録した利用者ページの利用者による投稿を確認できます（日時は個人設定に従います）。",
  );
  const tools = $("<p>")
    .addClass("wks-watchlist-users-tools")
    .append(
      createLink("ウォッチリスト", "Special:Watchlist"),
      " | ",
      createLink("最近の更新", "Special:RecentChanges"),
    );
  const { form, submit, details, updateFilterSummary } = createFilterForm(
    initialOptions,
    namespaces,
  );
  const status = $("<p>")
    .addClass("wks-watchlist-users-status")
    .prop({ role: "status", "aria-live": "polite" });
  const results = $("<div>").addClass("wks-watchlist-users-results");
  root.append(description, tools, form, status, results);
  content.replaceChildren(root[0]!);

  const api = new mw.Api();
  const currentUserName = mw.user.getName();
  const userRightsPromise = Promise.resolve(mw.user.getRights());
  let tagDisplayNamesPromise: Promise<ReadonlyMap<string, string>> | null =
    null;
  let watchedUserNames: string[] | null = null;
  let requestNumber = 0;

  const load = async (options: ViewOptions) => {
    const currentRequest = ++requestNumber;
    submit.prop("disabled", true);
    root.attr("aria-busy", "true");
    status.text("ウォッチリストと投稿記録を読み込んでいます…");
    renderSkeleton(results);
    updateUrl(options);
    updateFilterSummary(options);

    try {
      watchedUserNames ??= await fetchWatchedUserNames(api);
      if (currentRequest !== requestNumber) {
        return;
      }
      if (!watchedUserNames.length) {
        status.text("対象利用者は0人です。");
        results
          .empty()
          .append(
            $("<p>")
              .addClass("wks-watchlist-users-message")
              .text(
                "ウォッチリストに利用者ページまたは利用者会話ページがありません。対象ページをウォッチすると、ここに投稿記録が表示されます。",
              ),
          );
        return;
      }

      const selectedNamespaceIds = getNamespaceFilterIds(
        options.namespace,
        options.invert,
        options.associated,
        namespaceIds,
      );
      const contributions = await fetchUserContributions(
        api,
        watchedUserNames,
        {
          days: options.days,
          limit: options.limit,
          namespaceIds: selectedNamespaceIds,
          minor: options.minor,
          bots: options.bots,
          ...(options.hideSelf && currentUserName
            ? { excludeUserName: currentUserName }
            : {}),
        },
      );
      if (currentRequest !== requestNumber) {
        return;
      }
      const contributionTags = [
        ...new Set(contributions.flatMap(({ tags }) => tags ?? [])),
      ];
      const [userRights, watchedPages, tagDisplayNames, tagHelpPages] =
        await Promise.all([
          userRightsPromise,
          fetchWatchedPageInfo(
            api,
            contributions.map(({ pageid }) => pageid),
          ),
          contributionTags.length
            ? (tagDisplayNamesPromise ??= fetchTagDisplayNames(api))
            : Promise.resolve(new Map<string, string>()),
          contributionTags.length
            ? fetchTagHelpPages(
                api,
                contributionTags,
                String(mw.config.get("wgContentLanguage")),
              )
            : Promise.resolve(new Map<string, string>()),
        ]);
      if (currentRequest !== requestNumber) {
        return;
      }
      status.text(
        `対象利用者${watchedUserNames.length}人、過去${options.days}日間の投稿記録${contributions.length}件を表示しています。`,
      );
      if (contributions.length) {
        renderContributions(results, contributions, {
          api,
          canRollback: userRights.includes("rollback"),
          watchedPages,
          tagDisplayNames,
          tagHelpPages,
        });
      } else {
        results
          .empty()
          .append(
            $("<p>")
              .addClass("wks-watchlist-users-message")
              .text("指定した条件に一致する投稿記録はありません。"),
          );
      }
    } catch (error) {
      if (currentRequest !== requestNumber) {
        return;
      }
      status.text("読み込みに失敗しました。");
      results
        .empty()
        .append(
          $("<p>")
            .addClass(
              "wks-watchlist-users-message wks-watchlist-users-message-error",
            )
            .prop("role", "alert")
            .text(getErrorMessage(error)),
        );
    } finally {
      if (currentRequest === requestNumber) {
        submit.prop("disabled", false);
        root.removeAttr("aria-busy");
      }
    }
  };

  form.on("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form[0] as HTMLFormElement);
    const params = new URLSearchParams(
      [...data.entries()].map(([key, value]) => [key, String(value)]),
    );
    params.set(
      "hideself",
      form.find<HTMLInputElement>("[name=hideself]").prop("checked")
        ? "1"
        : "0",
    );
    const options = getViewOptions(params, namespaceIds);
    details.prop("open", false);
    void load(options);
  });

  await load(initialOptions);
}
