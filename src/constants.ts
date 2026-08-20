export const DEV = false;

// 変更必須
export const VERSION = "0.13.0";

export const SCRIPT_NAME = "WKSpinner";
export const SKJ_REQUEST_PAGE_NAME = DEV
  ? "利用者:鈴音雨/削除依頼テスト/"
  : "Wikipedia:削除依頼/";
export const UFD_REQUEST_PAGE_NAME = DEV
  ? "利用者:鈴音雨/利用者ページの削除依頼テスト"
  : "Wikipedia:利用者ページの削除依頼";
export const RFD_REQUEST_PAGE_NAME = DEV
  ? "利用者:鈴音雨/リダイレクトの削除依頼テスト"
  : "Wikipedia:リダイレクトの削除依頼/受付";
export const RFP_REQUEST_PAGE_NAMES = {
  protect: DEV ? "利用者:鈴音雨/保護依頼テスト" : "Wikipedia:保護依頼",
  unprotect: DEV
    ? "利用者:鈴音雨/保護解除依頼テスト"
    : "Wikipedia:保護解除依頼",
} as const;
export const CONFIG_PAGE_NAME = "利用者:鈴音雨/WKSpinner/Preferences";
export const DEBUG_PAGE_NAME = "利用者:鈴音雨/WKSpinner/Debug";
export const WATCHLIST_USERS_PAGE_NAME =
  "利用者:鈴音雨/WKSpinner/WatchlistUsers";
export const OPTIONS_KEY = "userjs-wkspinner";
export const VERSION_OPTIONS_KEY = "userjs-wkspinner-version";
export const SUMMARY_AD =
  " ([[利用者:鈴音雨/WKSpinner|" + SCRIPT_NAME + "]]使用)";
export const SUMMARY_AD_ATTRACT =
  '(<a href="/wiki/利用者:鈴音雨/WKSpinner" target="_blank">' +
  SCRIPT_NAME +
  "</a>使用)";
export const RELEASE_NOTES = "/wiki/利用者:鈴音雨/WKSpinner#リリースノート";

export const ORIG_PORTLET_ID = "p-wks";
export const PORTLET_LABEL = "WK";

export const ISSUE_TEMPLATE_AREA = "WKSPINNER_ISSUE_TEMPLATE_AREA";

export const HATNOTE_TEMPLATES = [
  { name: "Catmain", aliases: [] },
  { name: "Dablink", aliases: [] },
  { name: "Hatnote", aliases: [] },
  { name: "Otheruses", aliases: ["About", "Other uses"] },
  { name: "Otheruses2", aliases: ["Other uses2"] },
  { name: "Otheruseslist", aliases: [] },
  { name: "Redirect", aliases: ["転送"] },
  { name: "Redirect-multi", aliases: [] },
  { name: "Redirect2", aliases: [] },
  { name: "Redirect3", aliases: [] },
  { name: "Redirect3list", aliases: [] },
  { name: "Redirectlist", aliases: [] },
  { name: "See Wiktionary", aliases: ["See wt", "See wiktionary"] },
  { name: "Self reference", aliases: ["Selfref"] },
  { name: "Transcluded section", aliases: [] },
  { name: "Wikinewsの案内", aliases: [] },
  { name: "WikipediaPage", aliases: [] },
  { name: "簡易区別", aliases: [] },
  { name: "誤表記リダイレクト", aliases: [] },
  {
    name: "混同",
    aliases: [
      "Distinguish",
      "Confused",
      "Confuse",
      "Dist",
      "Not to be confused with",
    ],
  },
  { name: "混同2", aliases: ["Distinguish2", "Confused2", "Confuse2"] },
  { name: "別人", aliases: [] },
] as const;

export type Options = {
  disableMobile: boolean;
  prefLinkInToolbar: boolean;
  useIndividualPortlet: boolean;
  useCodexModal: boolean;
  versionNotify: string;
  timezone: string;
  historyTimeFormat: string;
  wikidata: {
    enabled: boolean;
  };
  mi: {
    enabled: boolean;
    enableMobile: boolean;
    default: {
      summary: string;
    };
  };
  csd: {
    enabled: boolean;
    enableMobile: boolean;
    default: {
      summary: string;
    };
  };
  csrd: {
    enabled: boolean;
    enableMobile: boolean;
    default: {
      summary: string;
    };
  };
  skj: {
    enabled: boolean;
    enableMobile: boolean;
    default: {
      opv: string;
      summaryTemplate: string;
      summaryUfdTemplate: string;
      summarySubmit: string;
      summaryNote: string;
    };
    opvPresets: {
      name: string;
      value: string;
    }[];
    signReason: boolean;
  };
  editCount: {
    enabled: boolean;
    enableMobile: boolean;
  };
  warn: {
    enabled: boolean;
    enableMobile: boolean;
    default: {
      summary: string;
    };
  };
  rfp: {
    enabled: boolean;
    enableMobile: boolean;
    default: {
      summaryTemplate: string;
      summarySubmit: string;
    };
  };
};

export const DEFAULT_OPTIONS = {
  disableMobile: false,
  prefLinkInToolbar: true,
  useIndividualPortlet: false,
  useCodexModal: false,
  versionNotify: "all",
  timezone: "UTC",
  historyTimeFormat:
    "(\\d{4})年(\\d{1,2})月(\\d{1,2})日 \\((.)\\) (\\d{2}):(\\d{2})|YMDWHm",
  wikidata: {
    enabled: false,
  },
  mi: {
    enabled: true,
    enableMobile: true,
    default: {
      summary: "+{{$t}}",
    },
  },
  csd: {
    enabled: true,
    enableMobile: true,
    default: {
      summary: "+sd",
    },
  },
  csrd: {
    enabled: true,
    enableMobile: true,
    default: {
      summary: "+srd",
    },
  },
  skj: {
    enabled: true,
    enableMobile: true,
    default: {
      opv: "",
      summaryTemplate: "+Sakujo",
      summaryUfdTemplate: "+Ufd",
      summarySubmit: "削除依頼",
      summaryNote: "削除依頼の追加",
    },
    opvPresets: [
      { name: "削除", value: "{{AFD|削除}} 依頼者票。" },
      { name: "版指定削除", value: "{{AFD|版指定削除}} 依頼者票。" },
      { name: "なし", value: "依頼者票はありません。" },
    ],
    signReason: false,
  },
  editCount: {
    enabled: false,
    enableMobile: false,
  },
  warn: {
    enabled: true,
    enableMobile: true,
    default: {
      summary: "+{{$t}}",
    },
  },
  rfp: {
    enabled: true,
    enableMobile: true,
    default: {
      summaryTemplate: "+保護依頼",
      summarySubmit: "+$p",
    },
  },
} as const satisfies Options;

export type SDReason = {
  type: string;
  name: string;
  num: number;
  shortDesc: string;
  params: ({
    id: number | null;
    name: string;
    required: boolean;
  } & (
    | { type: "input"; placeholder: string }
    | {
        type: "select";
        choices: {
          name: string;
          id: string;
        }[];
      }
  ))[];
  blank: boolean;
};

export type SRDReason = {
  type: string;
  name: string;
  shortDesc: string;
  params: ({
    id: number | null;
    name: string;
    required: boolean;
  } & (
    | { type: "input"; placeholder: string }
    | {
        type: "select";
        choices: {
          name: string;
          id: string;
        }[];
      }
  ))[];
};

export const SD_REASON = [
  {
    type: "全般",
    name: "全般1",
    num: 1,
    shortDesc: "内容が全く意味を持たないページ（意味不明な書き込み）",
    params: [],
    blank: false,
  },
  {
    type: "全般",
    name: "全般2",
    num: 2,
    shortDesc: "投稿テストと思われるもの",
    params: [],
    blank: false,
  },
  {
    type: "全般",
    name: "全般3",
    num: 3,
    shortDesc: "荒らしに分類される投稿",
    params: [],
    blank: false,
  },
  {
    type: "全般",
    name: "全般4",
    num: 4,
    shortDesc: "宣伝・広告が目的であるページ",
    params: [
      {
        id: 2,
        type: "input",
        name: "「露骨な宣伝・広告のみが目的」と判断される根拠",
        placeholder:
          "特売情報を前面に出しており、 出典も当該店の広告チラシへのリンクとなっている。",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "全般",
    name: "全般5",
    num: 5,
    shortDesc: "削除されたページの改善なき再作成",
    params: [
      {
        id: 2,
        type: "input",
        name: "過去の削除依頼",
        placeholder: "ほげほげ",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "全般",
    name: "全般6",
    num: 6,
    shortDesc: "ウィキペディア内のコピペによる作成",
    params: [
      {
        id: 2,
        type: "input",
        name: "コピペ元のページ",
        placeholder: "ほげほげ",
        required: true,
      },
      {
        id: 3,
        type: "input",
        name: "言語コード(JAWPの場合不要)",
        placeholder: "en",
        required: false,
      },
    ],
    blank: true,
  },
  {
    type: "全般",
    name: "全般8",
    num: 8,
    shortDesc: "初版投稿者による依頼または白紙化",
    params: [],
    blank: false,
  },
  {
    type: "全般",
    name: "全般9",
    num: 9,
    shortDesc: "著作権侵害が明白であると判断されるもの",
    params: [
      {
        id: 2,
        name: "侵害元のページ",
        type: "input",
        placeholder: "https://example.com/hogehoge",
        required: true,
      },
    ],
    blank: true,
  },
  {
    type: "全般",
    name: "全般10",
    num: 10,
    shortDesc: "特定の荒らし利用者が作成したページ",
    params: [
      {
        id: 2,
        name: "荒らし利用者",
        type: "select",
        choices: [
          { name: "未指定", id: "null" },
          { name: "Ellsiemall系 (LTA:ELLS) (カテゴリのみ)", id: "ellsiemall" },
          { name: "ヒースロー系 (LTA:HEATHROW)", id: "heathrow" },
          { name: "Hightechodap系 (LTA:HGTCHDP)", id: "hightechodap" },
          {
            name: "CAT,RD,SS乱造系 (LTA:NTTPC) (BL歴有利用者・IP作成の記事/未使用・2024年6月16日以降のカテゴリのみ)",
            id: "nttpc",
          },
          { name: "Suzukitaro系 (LTA:SUZU)", id: "suzu" },
          {
            name: "らやまはなたさかあ系 (LTA:RAYA) (作成した全記事/2024年8月22日以降の全ての記事以外)",
            id: "raya",
          },
          {
            name: "Alec Smithson系 (LTA:ALS) (日本語版未BLの場合他言語版を引数に言語名を書くorリンクなどで明記)",
            id: "als",
          },
          { name: "Sorrysorry系 (LTA:SORRY)", id: "sorry" },
          { name: "さんさんさんさん系 (LTA:SAN)", id: "san" },
          { name: "NMT系 (LTA:NMT)", id: "nmt" },
          { name: "中央アジア史サブスタブ濫造系 (LTA:CASTUB)", id: "castub" },
          { name: "かめでぃー系 (LTA:KAMEDY)", id: "kamedy" },
          {
            name: "Internet Libertarian系 (WP:VIP#Internet_Libertarian)",
            id: "internet-libertarian",
          },
        ],
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "記事",
    name: "記事1",
    num: 1,
    shortDesc: "定義になっていない、あるいは文章になっていないもの",
    params: [
      {
        id: 2,
        name: "定義なしと判断される理由",
        type: "input",
        placeholder: "数値データ表のみの記載で、定義となる説明文が一切ない",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト1-1",
    num: 1.1,
    shortDesc: "直接関係のないページへのリダイレクト",
    params: [],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト1-2",
    num: 1.2,
    shortDesc: "単純なタイプミスなど明らかな書き誤りのもの",
    params: [
      {
        id: 2,
        name: "書き誤り箇所",
        type: "input",
        placeholder: "ニが漢字の二",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト1-3",
    num: 1.3,
    shortDesc: "転送先がないリダイレクト",
    params: [],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト1-4",
    num: 1.4,
    shortDesc: "他言語版へのリダイレクト",
    params: [],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト2-1",
    num: 2.1,
    shortDesc: "全角と半角の使い分けに反するリダイレクト",
    params: [
      {
        id: 2,
        name: "全角と半角の使い分けに反する箇所",
        type: "input",
        placeholder: "全角数字８",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト2-2",
    num: 2.2,
    shortDesc: "作品名を鍵括弧等でくくったもの",
    params: [],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト2-3",
    num: 2.3,
    shortDesc: "記事名が作品名でない場合における読み等の併記",
    params: [],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト2-5",
    num: 2.5,
    shortDesc: "曖昧さ回避の括弧の付け方に反するリダイレクト",
    params: [
      {
        id: 2,
        name: "曖昧さ回避の括弧の付け方に反する箇所",
        type: "input",
        placeholder: "括弧が全角丸括弧になっている",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト2-6",
    num: 2.6,
    shortDesc: "人名の表記についての慣例に反するリダイレクト",
    params: [],
    blank: false,
  },
  {
    type: "リダイレクト",
    name: "リダイレクト4",
    num: 4,
    shortDesc: "唯一の投稿者による移動の残骸で本人依頼のもの",
    params: [],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル1-2",
    num: 1.2,
    shortDesc: "ウィキメディア・コモンズからのコピー",
    params: [
      {
        id: 2,
        name: "コモンズのファイル名",
        type: "input",
        placeholder: "commons-file.png",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル1-3",
    num: 1.3,
    shortDesc: "他プロジェクト由来のファイル",
    params: [
      {
        id: 2,
        name: "コモンズのファイル名",
        type: "input",
        placeholder: "commons-file.png",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル1-4",
    num: 1.4,
    shortDesc: "JAWPと同一の投稿者によって投稿されたファイル",
    params: [
      {
        id: 2,
        name: "コモンズのファイル名",
        type: "input",
        placeholder: "commons-file.png",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル1-5",
    num: 1.5,
    shortDesc: "ウィキメディア・コモンズへコピーされたファイル",
    params: [
      {
        id: 2,
        name: "コモンズのファイル名",
        type: "input",
        placeholder: "commons-file.png",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル3",
    num: 3,
    shortDesc: "重複ファイル",
    params: [
      {
        id: 2,
        name: "重複ファイル名",
        type: "input",
        placeholder: "file.png",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル5",
    num: 5,
    shortDesc: "著作権不明なファイル(投稿者に通知済み)",
    params: [
      {
        id: 2,
        name: "投稿者への通知場所",
        type: "input",
        placeholder: "利用者―会話:Example",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル6",
    num: 6,
    shortDesc: "著作権侵害が明白であると判断されるもの",
    params: [
      {
        id: 2,
        name: "自由利用ができない根拠",
        type: "input",
        placeholder: "画像に著作権保護のマークが入っている",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル7",
    num: 7,
    shortDesc: "コモンズのファイルページ",
    params: [],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル8",
    num: 8,
    shortDesc: "存在しないファイルのファイルページ",
    params: [],
    blank: false,
  },
  {
    type: "ファイル",
    name: "ファイル9",
    num: 9,
    shortDesc: "初版投稿者による即時削除貼り付け",
    params: [],
    blank: false,
  },
  {
    type: "カテゴリ",
    name: "カテゴリ1",
    num: 1,
    shortDesc: "初版から他のページへのリダイレクト",
    params: [],
    blank: false,
  },
  {
    type: "カテゴリ",
    name: "カテゴリ3",
    num: 3,
    shortDesc: "私的カテゴリ",
    params: [],
    blank: false,
  },
  {
    type: "カテゴリ",
    name: "カテゴリ6",
    num: 6,
    shortDesc: "合意により空カテゴリになったもの",
    params: [
      {
        id: 2,
        name: "合意の場所",
        type: "input",
        placeholder:
          "プロジェクト:カテゴリ関連/議論/20xx年/x月x日#議論セクション",
        required: true,
      },
    ],
    blank: false,
  },
  {
    type: "利用者ページ",
    name: "利用者ページ1",
    num: 1,
    shortDesc: "本人希望",
    params: [],
    blank: true,
  },
  {
    type: "利用者ページ",
    name: "利用者ページ2",
    num: 2,
    shortDesc: "存在しない利用者",
    params: [],
    blank: false,
  },
  {
    type: "利用者ページ",
    name: "利用者ページ3",
    num: 3,
    shortDesc: "IP利用者の利用者ページ",
    params: [],
    blank: false,
  },
] as const satisfies SDReason[];

export const SRD_REASON = [
  {
    type: "1",
    name: "1-1",
    shortDesc: "荒らしによる著作権侵害・ライセンス問題",
    params: [
      {
        id: 3,
        name: "著作権侵害の詳細",
        type: "input",
        placeholder: "https://example.com/hogehoge からの転載",
        required: true,
      },
    ],
  },
  {
    type: "1",
    name: "1-2",
    shortDesc: "荒らしによるプライバシー侵害問題",
    params: [
      {
        id: 3,
        name: "プライバシー侵害の詳細",
        type: "input",
        placeholder: "非公開氏名と電話番号の記載",
        required: true,
      },
    ],
  },
  {
    type: "1",
    name: "1-3",
    shortDesc: "荒らしによる名誉毀損問題",
    params: [
      {
        id: 3,
        name: "名誉毀損問題の詳細",
        type: "input",
        placeholder: "冒頭に虚偽の逮捕歴の記載",
        required: true,
      },
    ],
  },
  {
    type: "2",
    name: "2",
    shortDesc: "パスワード公開",
    params: [],
  },
] as const satisfies SRDReason[];

export type IssueTemplateParam =
  | {
      name: string;
      id: string;
      type: "input";
      required: boolean;
      singleName?: string | null;
      multipleName?: string | null;
      position?: number;
      placeholder?: string;
    }
  | {
      name: string;
      id: string;
      type: "select";
      choices: {
        name: string;
        id: string;
        value?: string;
      }[];
      required: boolean;
      singleName?: string | null;
      multipleName?: string | null;
      position?: number;
    };

export type MIChoice = {
  name: string;
  id: string;
  aliases?: string[];
  params: IssueTemplateParam[];
};

export type StandaloneIssueChoice = MIChoice & {
  category: string;
  hasDate: boolean;
};

const NOT_ENCYCLOPEDIC_TYPES = [
  {
    name: "紙製の百科事典ではない (NOTPAPER)",
    id: "NOTPAPER",
    value: "NOTPAPER",
  },
  {
    name: "辞書や字引ではない (NOTDICDEF)",
    id: "NOTDICDEF",
    value: "NOTDICDEF",
  },
  {
    name: "辞書や字引ではない (NOTDICTIONARY)",
    id: "NOTDICTIONARY",
    value: "NOTDICTIONARY",
  },
  { name: "独自の考えの発表場所ではない (NOTOR)", id: "NOTOR", value: "NOTOR" },
  {
    name: "独自の発明の発表場所ではない (NOTCOOL)",
    id: "NOTCOOL",
    value: "NOTCOOL",
  },
  {
    name: "個人的なエッセイの発表場所ではない (NOTESSAY)",
    id: "NOTESSAY",
    value: "NOTESSAY",
  },
  { name: "おしゃべりの場ではない (NOTCHAT)", id: "NOTCHAT", value: "NOTCHAT" },
  {
    name: "公開討論の場ではない (NOTFORUM)",
    id: "NOTFORUM",
    value: "NOTFORUM",
  },
  {
    name: "ジャーナリズムの場ではない (NOTJOURNALISM)",
    id: "NOTJOURNALISM",
    value: "NOTJOURNALISM",
  },
  {
    name: "演説台ではない (NOTSOAPBOX)",
    id: "NOTSOAPBOX",
    value: "NOTSOAPBOX",
  },
  {
    name: "プロパガンダや勧誘の場ではない (NOTADVOCATE)",
    id: "NOTADVOCATE",
    value: "NOTADVOCATE",
  },
  {
    name: "主張や論評の場ではない (NOTOPINION)",
    id: "NOTOPINION",
    value: "NOTOPINION",
  },
  {
    name: "ゴシップのまとめではない (NOTSCANDAL)",
    id: "NOTSCANDAL",
    value: "NOTSCANDAL",
  },
  {
    name: "広告宣伝の場ではない (NOTADVERTISING)",
    id: "NOTADVERTISING",
    value: "NOTADVERTISING",
  },
  { name: "単なるリンク集ではない (NOTLINK)", id: "NOTLINK", value: "NOTLINK" },
  {
    name: "資料の集積所ではない (NOTMIRROR)",
    id: "NOTMIRROR",
    value: "NOTMIRROR",
  },
  {
    name: "メディアファイルの保管場所ではない (NOTREPOSITORY)",
    id: "NOTREPOSITORY",
    value: "NOTREPOSITORY",
  },
  { name: "個人的なブログではない (NOTBLOG)", id: "NOTBLOG", value: "NOTBLOG" },
  {
    name: "個人的なウェブページではない (NOTWEBHOST)",
    id: "NOTWEBHOST",
    value: "NOTWEBHOST",
  },
  {
    name: "SNSではない (NOTSOCIALNET)",
    id: "NOTSOCIALNET",
    value: "NOTSOCIALNET",
  },
  {
    name: "追悼の場所ではない (NOTMEMORIAL)",
    id: "NOTMEMORIAL",
    value: "NOTMEMORIAL",
  },
  { name: "関連性の低い一覧ではない (NOTDIR)", id: "NOTDIR", value: "NOTDIR" },
  {
    name: "関連性の低い一覧ではない (NOTDIRECTORY)",
    id: "NOTDIRECTORY",
    value: "NOTDIRECTORY",
  },
  {
    name: "名鑑や番組ガイドではない (NOTTVGUIDE)",
    id: "NOTTVGUIDE",
    value: "NOTTVGUIDE",
  },
  {
    name: "系譜集ではない (NOTGENEALOGICAL)",
    id: "NOTGENEALOGICAL",
    value: "NOTGENEALOGICAL",
  },
  {
    name: "販売カタログではない (NOTCATALOG)",
    id: "NOTCATALOG",
    value: "NOTCATALOG",
  },
  { name: "電話帳ではない (NOTYELLOW)", id: "NOTYELLOW", value: "NOTYELLOW" },
  {
    name: "ガイドブックではない (NOTGUIDE)",
    id: "NOTGUIDE",
    value: "NOTGUIDE",
  },
  {
    name: "マニュアルではない (NOTMANUAL)",
    id: "NOTMANUAL",
    value: "NOTMANUAL",
  },
  {
    name: "旅行ガイドではない (NOTTRAVEL)",
    id: "NOTTRAVEL",
    value: "NOTTRAVEL",
  },
  {
    name: "インターネットガイドではない (NOTINTERNET)",
    id: "NOTINTERNET",
    value: "NOTINTERNET",
  },
  {
    name: "教科書ではない (NOTTEXTBOOK)",
    id: "NOTTEXTBOOK",
    value: "NOTTEXTBOOK",
  },
  {
    name: "学術論文ではない (NOT PAPERS)",
    id: "NOT PAPERS",
    value: "NOT PAPERS",
  },
  {
    name: "未来を予測する場ではない (NOTCRYSTAL)",
    id: "NOTCRYSTAL",
    value: "NOTCRYSTAL",
  },
  {
    name: "将来の出来事は確実なものに限る (FUTURE)",
    id: "FUTURE",
    value: "FUTURE",
  },
  {
    name: "憶測を提示する場ではない (SPECULATION)",
    id: "SPECULATION",
    value: "SPECULATION",
  },
  { name: "無差別な情報収集の場ではない (IINFO)", id: "IINFO", value: "IINFO" },
  {
    name: "無差別な情報収集の場ではない (INDISCRIMINATE)",
    id: "INDISCRIMINATE",
    value: "INDISCRIMINATE",
  },
  { name: "あらすじだけでは不十分 (NOTPLOT)", id: "NOTPLOT", value: "NOTPLOT" },
  { name: "FAQではない (NOTFAQ)", id: "NOTFAQ", value: "NOTFAQ" },
  {
    name: "歌詞データベースではない (NOTLYRICS)",
    id: "NOTLYRICS",
    value: "NOTLYRICS",
  },
  { name: "ニュース速報ではない (NOTNEWS)", id: "NOTNEWS", value: "NOTNEWS" },
  {
    name: "統計を過剰に記載する場ではない (NOTSTATS)",
    id: "NOTSTATS",
    value: "NOTSTATS",
  },
  { name: "事例研究の場ではない (NOTCASE)", id: "NOTCASE", value: "NOTCASE" },
  {
    name: "あらゆる細部の解説場所ではない (NOTCOMPLETE)",
    id: "NOTCOMPLETE",
    value: "NOTCOMPLETE",
  },
  {
    name: "検閲は行われない (NOTCENSORED)",
    id: "NOTCENSORED",
    value: "NOTCENSORED",
  },
  { name: "戦いの場ではない (BATTLE)", id: "BATTLE", value: "BATTLE" },
  {
    name: "無政府主義の実験場ではない (ANARCHY)",
    id: "ANARCHY",
    value: "ANARCHY",
  },
  {
    name: "民主主義の実験場ではない (DEMOCRACY)",
    id: "DEMOCRACY",
    value: "DEMOCRACY",
  },
  { name: "官僚主義の実験場ではない (BURO)", id: "BURO", value: "BURO" },
] as const;

export const MI_CHOICES = [
  {
    name: "出典の明記",
    id: "cite",
    params: [],
    aliases: [
      "references",
      "unreferenced",
      "refimprove",
      "出典明記",
      "unref",
      "出典なし",
    ],
  },
  {
    name: "存命人物の出典明記",
    id: "cite-living",
    params: [],
    aliases: ["blpsources", "blp sources"],
  },
  {
    name: "存命人物の出典皆無",
    id: "cite-living-no",
    params: [],
    aliases: ["blp unsourced"],
  },
  { name: "参照方法", id: "ref", params: [], aliases: ["citation style"] },
  {
    name: "脚注の不足",
    id: "ref-lack",
    params: [],
    aliases: ["more footnotes"],
  },
  { name: "未検証", id: "unverified", params: [], aliases: ["not verified"] },
  {
    name: "単一の出典",
    id: "single",
    params: [],
    aliases: [
      "one source",
      "onesource",
      "single source",
      "singlesource",
      "唯一の出典",
    ],
  },
  {
    name: "一次資料",
    id: "primary",
    params: [],
    aliases: ["一次資料のみ", "primary sources"],
  },
  { name: "信頼性", id: "cite-accuracy", params: [], aliases: ["精度"] },
  {
    name: "更新",
    id: "update",
    params: [],
    aliases: ["update", "同期", "sync"],
  },
  { name: "大言壮語", id: "boast", params: [] },
  {
    name: "自分自身の記事",
    id: "self",
    aliases: ["autobiography"],
    params: [],
  },
  {
    name: "ファンサイト的",
    id: "fan",
    aliases: ["fansite"],
    params: [
      {
        name: "議論ページ",
        id: "talk",
        type: "input",
        singleName: "t",
        multipleName: null,
        placeholder: "ノート:記事名#節名",
        required: false,
      },
    ],
  },
  {
    name: "観点",
    id: "view",
    params: [],
    aliases: ["pov", "npov", "中立的な観点", "中立", "coi"],
  },
  {
    name: "独自研究",
    id: "research",
    params: [],
    aliases: ["original research", "独自の研究", "独自調査"],
  },
  { name: "正確性", id: "accuracy", params: [], aliases: ["disputed"] },
  { name: "要改訳", id: "translation", params: [] },
  { name: "言葉を濁さない", id: "vague", params: [], aliases: ["weasel"] },
  {
    name: "特筆性",
    id: "notable",
    params: [
      {
        name: "分野",
        singleName: null,
        id: "genre",
        type: "select",
        choices: [
          { name: "未指定", id: "null" },
          { name: "ウェブ", id: "web" },
          { name: "音楽", id: "music" },
          { name: "書籍", id: "book" },
          { name: "人物", id: "person" },
          { name: "組織", id: "organization" },
          { name: "フィクション", id: "fiction" },
        ],
        required: false,
      },
    ],
    aliases: ["notability", "著名性"],
  },
  {
    name: "国際化",
    id: "i18n",
    params: [{ name: "領域", id: "area", type: "input", required: false }],
    aliases: ["globalize", "グローバル", "worldwideview"],
  },
  { name: "宣伝", id: "advert", params: [], aliases: ["advert", "ad"] },
  { name: "孤立", id: "orphan", params: [], aliases: ["orphan"] },
  { name: "Wikify", id: "wikify", params: [] },
  {
    name: "導入部が長い",
    id: "lead-long",
    aliases: ["intro too long", "lead too long", "lead section too long"],
    params: [],
  },
  {
    name: "導入部が短い",
    id: "lead-short",
    aliases: ["要概要"],
    params: [],
  },
  {
    name: "百科事典的でない",
    id: "not-encyclopedic",
    aliases: ["百科事典に不適当"],
    params: [
      {
        name: "タイプ",
        id: "type",
        type: "select",
        singleName: "type",
        multipleName: null,
        choices: [{ name: "未指定", id: "null" }, ...NOT_ENCYCLOPEDIC_TYPES],
        required: false,
      },
      {
        name: "カスタムテキスト (タイプと併用不可)",
        id: "text",
        type: "input",
        singleName: "text",
        multipleName: null,
        placeholder: "[[WP:NOT|…ではありません]]",
        required: false,
      },
    ],
  },
  {
    name: "専門的",
    id: "technical",
    aliases: ["technical"],
    params: [],
  },
  {
    name: "雑多な内容の箇条書き",
    id: "list",
    params: [],
    aliases: ["雑多", "trivia"],
  },
  { name: "内容過剰", id: "excessive", params: [] },
  {
    name: "リンク過剰",
    id: "link-excessive",
    aliases: ["overlinked", "過剰リンク"],
    params: [],
  },
  { name: "画像過剰", id: "image", params: [] },
  {
    name: "物語世界内の観点",
    id: "fictional",
    params: [],
    aliases: ["in-universe"],
  },
] as const satisfies MIChoice[];

export const STANDALONE_ISSUE_CHOICES = [
  {
    name: "著作権問題調査依頼",
    id: "copyright-investigation",
    aliases: ["転載疑い1", "copy", "転載疑い"],
    category: "著作権侵害",
    hasDate: false,
    params: [
      {
        name: "対象範囲",
        id: "scope",
        type: "select",
        singleName: null,
        choices: [
          { name: "未指定", id: "null" },
          { name: "多数", id: "many", value: "多数" },
        ],
        required: false,
      },
      {
        name: "議論ページ",
        id: "talk",
        type: "input",
        singleName: "t",
        placeholder: "Wikipedia:著作権問題調査依頼/○○",
        required: false,
      },
    ],
  },
  {
    name: "AI生成",
    id: "ai-generated",
    aliases: ["ai-generated"],
    category: "LLM生成が疑われる記事",
    hasDate: true,
    params: [
      {
        name: "判断理由",
        id: "reason",
        type: "input",
        singleName: "reason",
        placeholder: "不自然な出典や文章表現が見られる",
        required: true,
      },
      {
        name: "議論ページ",
        id: "talk",
        type: "input",
        singleName: "talk",
        placeholder: "ノート:記事名#節名",
        required: false,
      },
    ],
  },
  {
    name: "ページ番号",
    id: "page-numbers",
    category: "出典関連",
    hasDate: true,
    params: [
      {
        name: "対象の名称",
        id: "target-name",
        type: "input",
        singleName: null,
        placeholder: "記事、節、一覧",
        required: false,
      },
    ],
  },
  {
    name: "No footnotes",
    id: "no-footnotes",
    aliases: ["脚注皆無"],
    category: "出典関連",
    hasDate: true,
    params: [
      {
        name: "存命人物の否定的情報",
        id: "blp",
        type: "select",
        singleName: "BLP",
        choices: [
          { name: "未指定", id: "null" },
          { name: "はい", id: "yes", value: "yes" },
        ],
        required: false,
      },
    ],
  },
  {
    name: "Ibid",
    id: "ibid",
    category: "出典関連",
    hasDate: true,
    params: [],
  },
  {
    name: "TVWATCH",
    id: "tvwatch",
    category: "出典関連",
    hasDate: false,
    params: [],
  },
  {
    name: "RADIOLISTEN",
    id: "radiolisten",
    category: "出典関連",
    hasDate: false,
    params: [],
  },
  {
    name: "医学の情報源",
    id: "medical-sources",
    aliases: ["medref"],
    category: "医学の出典",
    hasDate: true,
    params: [
      {
        name: "限られた臨床試験に依存",
        id: "limit",
        type: "select",
        singleName: "limit",
        choices: [
          { name: "未指定", id: "null" },
          { name: "はい", id: "yes", value: "1" },
        ],
        required: false,
      },
      {
        name: "議論ページ",
        id: "talk",
        type: "input",
        singleName: "talk",
        placeholder: "ノート:記事名#節名",
        required: false,
      },
    ],
  },
  {
    name: "色の使用",
    id: "color",
    aliases: ["overcoloured", "色の過剰使用", "overcolored"],
    category: "スタイル",
    hasDate: false,
    params: [
      {
        name: "問題の種類",
        id: "problem-type",
        type: "select",
        singleName: null,
        choices: [
          { name: "未指定", id: "null" },
          { name: "コントラスト比", id: "contrast" },
          { name: "唯一", id: "only" },
        ],
        required: false,
      },
    ],
  },
  {
    name: "一部ブラウザで表示できない",
    id: "browser-display",
    category: "スタイル",
    hasDate: true,
    params: [
      {
        name: "問題が生じるブラウザ",
        id: "browser",
        type: "input",
        singleName: null,
        placeholder: "ブラウザ名",
        required: false,
      },
    ],
  },
  {
    name: "導入部がない",
    id: "no-lead",
    aliases: ["lead missing"],
    category: "導入部",
    hasDate: true,
    params: [],
  },
  {
    name: "導入部がおかしい",
    id: "lead-problem",
    category: "導入部",
    hasDate: true,
    params: [],
  },
  {
    name: "概要節がおかしい",
    id: "summary-section-problem",
    category: "導入部",
    hasDate: true,
    params: [],
  },
  {
    name: "Prose",
    id: "prose",
    aliases: ["散文形式", "散文", "散文体"],
    category: "箇条書きの散文化",
    hasDate: true,
    params: [],
  },
  {
    name: "Uncategorized",
    id: "uncategorized",
    aliases: ["不十分なカテゴライズ", "uncat"],
    category: "カテゴライズ",
    hasDate: true,
    params: [],
  },
  {
    name: "字引",
    id: "dictionary",
    category: "記事全般",
    hasDate: true,
    params: [],
  },
  {
    name: "Tone",
    id: "tone",
    category: "記事全般",
    hasDate: true,
    params: [
      {
        name: "議論ページ",
        id: "talk",
        type: "input",
        singleName: "talk",
        placeholder: "ノート:記事名#節名",
        required: false,
      },
    ],
  },
  {
    name: "日本語表現",
    id: "japanese-expression",
    category: "記事全般",
    hasDate: true,
    params: [
      {
        name: "ソートキー",
        id: "sort-key",
        type: "input",
        placeholder: "記事名の読み",
        required: false,
      },
    ],
  },
  {
    name: "物語内容のみ",
    id: "plot-only",
    category: "フィクション",
    hasDate: true,
    params: [],
  },
  {
    name: "コモンズへの移動推奨",
    id: "move-to-commons-recommended",
    aliases: ["copy to wikimedia commons", "mtc", "move to commons"],
    category: "他のプロジェクトへ移動すべき",
    hasDate: false,
    params: [],
  },
  {
    name: "SVG化推奨",
    id: "svg-recommended",
    aliases: ["convert to svg"],
    category: "他のプロジェクトへ移動すべき",
    hasDate: false,
    params: [
      {
        name: "画像についての補足",
        id: "image-note",
        type: "input",
        singleName: null,
        placeholder: "図表やロゴ",
        required: false,
      },
    ],
  },
  {
    name: "SVG化とコモンズへの移動推奨",
    id: "svg-and-commons-recommended",
    category: "他のプロジェクトへ移動すべき",
    hasDate: false,
    params: [],
  },
  {
    name: "NowCommons",
    id: "now-commons",
    aliases: ["nc", "nowcommons", "nct", "nowcomons", "now commons"],
    category: "他のプロジェクトへ移動すべき",
    hasDate: false,
    params: [
      {
        name: "コモンズでのファイル名",
        id: "commons-file",
        type: "input",
        singleName: null,
        placeholder: "Example.svg",
        required: false,
      },
      {
        name: "再転送が必要",
        id: "retransfer",
        type: "select",
        singleName: "retransfer",
        choices: [
          { name: "未指定", id: "null" },
          { name: "はい", id: "yes", value: "yes" },
        ],
        required: false,
      },
    ],
  },
  {
    name: "コモンズへの移動",
    id: "move-to-commons",
    category: "他のプロジェクトへ移動すべき",
    hasDate: false,
    params: [
      {
        name: "コモンズでのファイル名",
        id: "commons-file",
        type: "input",
        singleName: null,
        placeholder: "Example.jpg",
        required: false,
      },
      {
        name: "転載した利用者",
        id: "transferring-user",
        type: "input",
        singleName: null,
        placeholder: "利用者名",
        required: false,
      },
    ],
  },
  {
    name: "外部リンクの注意",
    id: "external-links-notice",
    aliases: ["external links"],
    category: "外部リンク関連",
    hasDate: false,
    params: [],
  },
  {
    name: "Rough translation",
    id: "rough-translation",
    aliases: ["roughtranslation", "大ざっぱな翻訳"],
    category: "翻訳",
    hasDate: false,
    params: [
      {
        name: "翻訳元言語",
        id: "source-language",
        type: "input",
        singleName: null,
        placeholder: "英語",
        required: false,
      },
    ],
  },
  {
    name: "翻訳直後",
    id: "recently-translated",
    category: "翻訳",
    hasDate: true,
    params: [
      {
        name: "翻訳元版の情報",
        id: "source-revision",
        type: "input",
        singleName: null,
        placeholder: "英語版 2026年8月1日 (UTC) 版",
        required: true,
      },
      {
        name: "ソートキー",
        id: "sort-key",
        type: "input",
        placeholder: "記事名の読み",
        required: false,
      },
    ],
  },
  {
    name: "翻訳中途",
    id: "translation-in-progress",
    aliases: ["translating"],
    category: "翻訳",
    hasDate: true,
    params: [
      {
        name: "翻訳元版の情報",
        id: "source-revision",
        type: "input",
        singleName: null,
        placeholder: "英語版 2026年8月1日 (UTC) 版",
        required: true,
      },
    ],
  },
  {
    name: "Translation source missing",
    id: "translation-source-missing",
    category: "翻訳",
    hasDate: true,
    params: [],
  },
] as const satisfies StandaloneIssueChoice[];

export const ALL_ISSUE_CHOICES = [
  ...MI_CHOICES,
  ...STANDALONE_ISSUE_CHOICES,
] as const;

export const ERRORS = {
  unknownerror: "不明なエラーが発生しました。",
  protectednamespace: "保護された名前空間に対する編集はできません。",
  protectedpage: "保護されたページに対する編集はできません。",
  blocked: "あなたはブロックされているため、編集できません。",
  autoblocked: "あなたのIPアドレスがブロックされているため、編集できません。",
  ratelimited:
    "編集の頻度が高すぎます。しばらく待ってから再度編集してください。",
  missingtitle: "ページが存在しません。",
  spamdetected: "スパムの可能性がある編集が検出されました。",
  "abusefilter-disallowed": "編集がフィルターによってブロックされました。",
  noedit: "編集が許可されていません。",
  pagedeleted: "ページが削除されました。",
  editconflict:
    "編集が競合しました。ページを再読み込みしてから再度編集してください。",
} as const satisfies Record<string, string>;

export const NAMESPACE_MAP: ReadonlyMap<number, string> = new Map([
  [0, "記事"],
  [2, "利用者ページ"],
  [6, "ファイル"],
  [14, "カテゴリ"],
]);

export const REDLINK_REGEX =
  /w\/index\.php\?title=(.+?)(&action=edit)?&redlink=1/;

export const TIMEZONE_VALUES: ReadonlyMap<string, number> = new Map([
  ["UTC", 0],
  ["JST", 9],
]);
