export const DEV = false;

// 変更必須
export const VERSION = "0.11.0";

export const SCRIPT_NAME = "WKSpinner";
export const SKJ_REQUEST_PAGE_NAME = DEV
  ? "利用者:鈴音雨/削除依頼テスト/"
  : "Wikipedia:削除依頼/";
export const CONFIG_PAGE_NAME = "利用者:鈴音雨/WKSpinner/Preferences";
export const DEBUG_PAGE_NAME = "利用者:鈴音雨/WKSpinner/Debug";
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
] as const;

export type Options = {
  disableMobile: boolean;
  prefLinkInToolbar: boolean;
  useIndividualPortlet: boolean;
  versionNotify: string;
  timezone: string;
  historyTimeFormat: string;
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
  versionNotify: "all",
  timezone: "UTC",
  historyTimeFormat:
    "(\\d{4})年(\\d{1,2})月(\\d{1,2})日 \\((.)\\) (\\d{2}):(\\d{2})|YMDWHm",
  mi: {
    enabled: true,
    enableMobile: true,
    default: {
      summary: "+$t",
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
    name: "有償の寄稿",
    id: "paid-contributions",
    category: "中立的な観点",
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
      {
        name: "種類",
        id: "kind",
        type: "select",
        singleName: null,
        position: 3,
        choices: [
          { name: "未指定", id: "null" },
          { name: "節", id: "section" },
        ],
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

export type WarnTemplate = {
  name: string;
  description: string;
  params: {
    type: "input";
    name: string;
    id: string;
    required: boolean;
    placeholder: string;
    defaultValue?: string;
  }[];
  category: string;
  nosubst?: boolean;
} & ({ hasTitle: true } | { hasTitle: false; defaultTitle: string });

function warnInput(
  name: string,
  id: string,
  required: boolean,
  placeholder: string,
): WarnTemplate["params"][number] {
  return { type: "input", name, id, required, placeholder };
}

export const WARN_TEMPLATES = [
  {
    name: "Welcome",
    description: "新規利用者への歓迎",
    hasTitle: false,
    defaultTitle: "ウィキペディアへようこそ！",
    params: [],
    category: "ようこそ",
  },
  {
    name: "アカウント作成のお願い",
    description: "よく活動してるIPユーザーにアカウント作成を促す案内",
    hasTitle: false,
    defaultTitle: "アカウント作成のお願い",
    params: [],
    category: "ようこそ",
    nosubst: true,
  },
  {
    name: "Test0",
    description: "テキストを消してしまった場合の案内",
    hasTitle: false,
    defaultTitle: "ご案内",
    params: [
      {
        type: "input",
        name: "項目名",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
      {
        type: "input",
        name: "追加メッセージ",
        id: "2",
        required: false,
        placeholder: "「ご参照ください。」の後ろのメッセージ",
      },
    ],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Selftest",
    description: "テスト投稿を自分で差し戻した人に対しての案内",
    hasTitle: false,
    defaultTitle: "ご案内",
    params: [],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Test1",
    description: "テスト投稿の案内",
    hasTitle: false,
    defaultTitle: "ご案内",
    params: [
      {
        type: "input",
        name: "項目名",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Test2",
    description: "荒らしの注意 (もしくはTestで注意後)",
    hasTitle: false,
    defaultTitle: "注意",
    params: [
      {
        type: "input",
        name: "項目名",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Test2a",
    description: "白紙化や記述除去荒らしの注意",
    hasTitle: false,
    defaultTitle: "注意",
    params: [
      {
        type: "input",
        name: "項目名",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Test3",
    description: "荒らしの警告",
    hasTitle: false,
    defaultTitle: "警告",
    params: [
      {
        type: "input",
        name: "項目名",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Test4",
    description: "荒らし行為への最後の警告",
    hasTitle: false,
    defaultTitle: "最終警告",
    params: [
      {
        type: "input",
        name: "項目名",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Test",
    description: "通常のページでのテスト投稿に対する案内",
    hasTitle: false,
    defaultTitle: "ご案内",
    params: [warnInput("テスト投稿を行ったページ", "1", false, "ほげほげ")],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Uw-disruptive1",
    description: "非建設的な編集に対する初回の案内",
    hasTitle: false,
    defaultTitle: "ご案内",
    params: [],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Uw-disruptive2",
    description: "破壊的に見える編集に対する注意",
    hasTitle: false,
    defaultTitle: "注意",
    params: [],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Uw-disruptive3",
    description: "破壊的な編集を続ける利用者への警告",
    hasTitle: false,
    defaultTitle: "警告",
    params: [],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Uw3",
    description: "破壊的な編集を続ける利用者への警告",
    hasTitle: false,
    defaultTitle: "警告",
    params: [],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Uw4",
    description: "破壊的な編集に対する最終警告",
    hasTitle: false,
    defaultTitle: "最終警告",
    params: [],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Warn2",
    description: "荒らし相当の行為に対するレベル2の警告",
    hasTitle: false,
    defaultTitle: "注意",
    params: [warnInput("問題のある投稿を行ったページ", "1", false, "ほげほげ")],
    category: "Test (一般的なテストもしくは荒らし)",
  },
  {
    name: "Preview",
    description: "プレビューの案内",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "何回目？",
        id: "1",
        required: false,
        placeholder: "3回目",
      },
    ],
    category: "一括投稿・プレビュー",
  },
  {
    name: "PreviewMobile",
    description: "プレビューの案内 (モバイル)",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "何回目？",
        id: "1",
        required: false,
        placeholder: "3回目",
      },
    ],
    category: "一括投稿・プレビュー",
  },
  {
    name: "一括",
    description: "一括投稿の案内",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "何回目？",
        id: "1",
        required: false,
        placeholder: "3回目",
      },
    ],
    category: "一括投稿・プレビュー",
  },
  {
    name: "一括Preview",
    description: "一括投稿とプレビュー案内の組み合わせ",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "何回目？",
        id: "1",
        required: false,
        placeholder: "3回目",
      },
    ],
    category: "一括投稿・プレビュー",
  },
  {
    name: "Sign",
    description: "署名の案内",
    hasTitle: true,
    params: [],
    category: "コミュニケーション関係",
  },
  {
    name: "Attack",
    description: "利用者に対する個人攻撃の警告",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "問題のある投稿を行ったページ",
        id: "1",
        required: false,
        placeholder: "ノート:ほげほげ",
      },
    ],
    category: "コミュニケーション関係",
  },
  {
    name: "Edit war",
    description: "編集合戦への警告",
    hasTitle: false,
    defaultTitle: "編集合戦はおやめください",
    params: [],
    category: "コミュニケーション関係",
  },
  {
    name: "Notchat",
    description: "ノートページで私的な会話を続ける利用者に対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "ページ名",
        id: "1",
        required: false,
        placeholder: "利用者‐会話:ウィキ助",
      },
    ],
    category: "コミュニケーション関係",
  },
  {
    name: "Talk reject",
    description: "対話を拒否する利用者への警告",
    hasTitle: false,
    defaultTitle: "対話拒否はおやめください",
    params: [
      {
        type: "input",
        name: "対話拒否を行ったページ",
        id: "1",
        required: false,
        placeholder: "ノート:ほげほげ",
      },
    ],
    category: "コミュニケーション関係",
  },
  {
    name: "発言改竄",
    description: "発言改竄に対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "改竄されたページ",
        id: "1",
        required: true,
        placeholder: "ほげほげ",
      },
    ],
    category: "コミュニケーション関係",
  },
  {
    name: "Sign2",
    description: "無署名のコメントに対する署名のお願い",
    hasTitle: true,
    params: [
      warnInput("コメントを投稿したページ", "1", true, "ノート:ほげほげ"),
      warnInput("投稿版の oldid", "2", true, "123456789"),
      warnInput("投稿時刻", "3", true, "2026年8月4日 (火) 12:00 (UTC)"),
      warnInput("自分の署名", "4", false, "~~~~"),
    ],
    category: "コミュニケーション関係",
  },
  {
    name: "Talk reject 2",
    description: "対話拒否を続ける利用者への最終警告",
    hasTitle: false,
    defaultTitle: "対話拒否についての最終警告",
    params: [],
    category: "コミュニケーション関係",
  },
  {
    name: "Uw-notvand",
    description: "荒らしでない編集を荒らしと扱った利用者への案内",
    hasTitle: false,
    defaultTitle: "荒らしの扱いについて",
    params: [
      warnInput("対象の記事", "1", false, "ほげほげ"),
      warnInput("末尾のメッセージ", "2", false, "ありがとうございます。"),
    ],
    category: "コミュニケーション関係",
  },
  {
    name: "一般警告テンプレート貼付中止のお願い",
    description:
      "モバイル利用者への不適切な一般警告テンプレート貼付に対する注意",
    hasTitle: true,
    params: [
      warnInput("警告を受けたモバイル利用者名", "1", true, "Example"),
      warnInput("貼付されたテンプレート名", "2", true, "Preview"),
    ],
    category: "コミュニケーション関係",
  },
  {
    name: "会話ページの目的外利用",
    description: "ノートページや会話ページの目的外利用に対する警告",
    hasTitle: false,
    defaultTitle: "会話ページの目的外利用はおやめください",
    params: [],
    category: "コミュニケーション関係",
  },
  {
    name: "要約欄の目的外利用",
    description: "要約欄での会話や意見表明などの目的外利用に対する注意",
    hasTitle: true,
    params: [],
    category: "コミュニケーション関係",
  },
  {
    name: "利用者名変更のお願い",
    description: "混同のおそれや不適切な利用者名に対する変更依頼",
    hasTitle: true,
    params: [
      warnInput("変更を求める理由の種類", "1", true, "1 / 2 / 3"),
      warnInput("類似利用者名または具体的な理由", "2", false, "Example2"),
    ],
    category: "コミュニケーション関係",
  },
  {
    name: "Spam",
    description: "宣伝投稿への注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "冒頭文",
        id: "1",
        required: false,
        placeholder: "あなたの[[記事]]における編集を拝見致しました。",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "荒らしの差し戻し",
    description: "過剰な荒らしの差し戻しに対する警告",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "差し戻しを繰り返したページ",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
      {
        type: "input",
        name: "何回目?",
        id: "nth",
        required: false,
        placeholder: "3",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "ご自身の記事",
    description: "利用者自身の記事の作成・編集に対する注意 (確信がない場合)",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "編集したページ",
        id: "1",
        required: true,
        placeholder: "ほげほげ",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "ご自身の記事2",
    description: "利用者自身の記事の作成に対する注意 (明白な場合)",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "作成したページ",
        id: "1",
        required: true,
        placeholder: "ほげほげ",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "機械翻訳の濫用",
    description: "機械翻訳の濫用に対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "翻訳されたページ",
        id: "1",
        required: true,
        placeholder: "ほげほげ",
      },
      {
        type: "input",
        name: "使用された機械翻訳 (推定)",
        id: "2",
        required: true,
        placeholder: "Google翻訳",
        defaultValue: "Google翻訳",
      },
      {
        type: "input",
        name: "不自然な表現の例",
        id: "3",
        required: true,
        placeholder:
          "「アルコール使用は主に男の人口の間で高かった」「急いで混雑していました」",
      },
      {
        type: "input",
        name: "全般8 (初版投稿者依頼 )が適用可能→1、削除依頼提出済み→2を入力",
        id: "4",
        required: false,
        placeholder: "2",
      },
      {
        type: "input",
        name: "削除依頼ページ",
        id: "5",
        required: false,
        placeholder: "[[Wikipedia:削除依頼/記事名]]",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "Uw-ai1",
    description: "AI生成コンテンツの注意",
    hasTitle: false,
    defaultTitle: "大規模言語モデルの利用について",
    params: [
      {
        type: "input",
        name: "対象ページ",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "丸写し",
    description: "主に外部サイトからの丸写しの注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "丸写しされた記事名",
        id: "1",
        required: true,
        placeholder: "ほげほげ",
      },
      {
        type: "input",
        name: "コピー元",
        id: "2",
        required: true,
        placeholder: "[URL ページ名]",
      },
      {
        type: "input",
        name: "削除依頼提出済み→削除依頼サブページ名、全般9→「即時削除」を入力",
        id: "3",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "スタブ未満作成停止のお願い",
    description: "短すぎる記事作成の繰り返しの注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "何回目?",
        id: "1",
        required: false,
        placeholder: "3回目",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "記述除去",
    description: "記述の無断除去に対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "除去されたページ",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "翻訳継承",
    description: "翻訳継承ができていない場合の案内",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "翻訳されたページ",
        id: "1",
        required: true,
        placeholder: "ほげほげ",
      },
      {
        type: "input",
        name: "翻訳元",
        id: "2",
        required: true,
        placeholder: "[[:en:Main_Page]]",
      },
      {
        type: "input",
        name: "削除依頼提出済み→1、削除依頼提出をお願い→2を入力",
        id: "3",
        required: false,
        placeholder: "1",
      },
      {
        type: "input",
        name: "削除依頼ページ",
        id: "4",
        required: false,
        placeholder: "[[Wikipedia:削除依頼/記事名]]",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "出典提示のお願い",
    description: "出典を明記しない利用者に対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "ページ名",
        id: "1",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "特筆性のない記事の作成停止のお願い",
    description: "特筆性のない記事の作成の繰り返しの注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "何回目?",
        id: "1",
        required: false,
        placeholder: "3回目",
      },
    ],
    category: "投稿内容関係",
  },
  {
    name: "Contrib-en1",
    description: "日本語版に英語で投稿した利用者への案内",
    hasTitle: false,
    defaultTitle: "日本語での投稿のお願い",
    params: [],
    category: "投稿内容関係",
  },
  {
    name: "テンプレート除去",
    description:
      "問題を解決せずメンテナンス用テンプレートを除去した利用者への注意",
    hasTitle: true,
    params: [
      warnInput("テンプレートを除去した記事", "1", true, "ほげほげ"),
      warnInput("除去したテンプレート名", "2", true, "出典の明記"),
      warnInput("何回目のお願いか", "3", false, "2"),
    ],
    category: "投稿内容関係",
  },
  {
    name: "記事名の付け方違反",
    description: "記事名の付け方に違反した記事の移動通知",
    hasTitle: true,
    params: [
      warnInput("移動元の記事名", "1", true, "ほげほげ"),
      warnInput("移動先の記事名", "2", true, "ほげほげほげ"),
      warnInput("削除依頼に提出済み", "3", false, "1"),
    ],
    category: "投稿内容関係",
  },
  {
    name: "赤リンク削除",
    description: "ローカルルールによる未作成エントリの除去通知",
    hasTitle: true,
    params: [
      warnInput(
        "エントリを追加した一覧ページ名",
        "1",
        true,
        "ギタリストの一覧",
      ),
      warnInput(
        "議論を行うノートページ名",
        "2",
        false,
        "ノート:ギタリストの一覧",
      ),
    ],
    category: "投稿内容関係",
  },
  {
    name: "赤リンク追加",
    description:
      "ローカルルールのある一覧へ未作成エントリを追加した利用者への注意",
    hasTitle: true,
    params: [
      warnInput(
        "エントリを追加した一覧ページ名",
        "1",
        true,
        "ギタリストの一覧",
      ),
      warnInput(
        "議論を行うノートページ名",
        "2",
        false,
        "ノート:ギタリストの一覧",
      ),
    ],
    category: "投稿内容関係",
  },
  {
    name: "体験談加筆の中止のお願い",
    description: "個人的な体験談の加筆を繰り返す利用者への中止依頼",
    hasTitle: true,
    params: [],
    category: "投稿内容関係",
  },
  {
    name: "提案手順不備",
    description: "分割・統合・改名提案の手順不備に対する案内",
    hasTitle: true,
    params: [
      warnInput(
        "提案の種類",
        "1",
        true,
        "分割1 / 分割2 / 統合1 / 統合2 / 改名1 / 改名2",
      ),
      warnInput("提案対象の記事名", "2", true, "ほげほげ"),
    ],
    category: "投稿内容関係",
  },
  {
    name: "不適切な概要節",
    description: "導入部の直後を安易に概要節とした編集への注意",
    hasTitle: true,
    params: [],
    category: "投稿内容関係",
  },
  {
    name: "目撃情報加筆の中止のお願い",
    description: "個人的な目撃情報の加筆に対する中止依頼",
    hasTitle: true,
    params: [],
    category: "投稿内容関係",
  },
  {
    name: "Blp0",
    description: "存命人物に関する記事を編集する際の案内",
    hasTitle: false,
    defaultTitle: "存命人物に関する記事の編集について",
    params: [],
    category: "出典・検証可能性",
  },
  {
    name: "Blp1",
    description: "存命人物への無出典の否定的記述に対する警告",
    hasTitle: false,
    defaultTitle: "存命人物に関する記事の編集について",
    params: [warnInput("問題のある投稿を行ったページ", "1", false, "ほげほげ")],
    category: "出典・検証可能性",
  },
  {
    name: "Blp2",
    description: "存命人物への無出典の否定的記述に対する最終警告",
    hasTitle: false,
    defaultTitle: "存命人物に関する記事の編集について",
    params: [],
    category: "出典・検証可能性",
  },
  {
    name: "Uw-badsourced",
    description: "信頼できない情報源の使用に対する警告",
    hasTitle: false,
    defaultTitle: "信頼できる情報源のお願い",
    params: [warnInput("問題のある編集を行ったページ", "1", true, "ほげほげ")],
    category: "出典・検証可能性",
  },
  {
    name: "Uw-pretense",
    description: "出典にない内容を加筆した利用者への警告",
    hasTitle: false,
    defaultTitle: "出典に基づく記述のお願い",
    params: [
      warnInput(
        "問題のある編集の版指定リンク",
        "1",
        true,
        "{{特定版|ほげほげ|123456789}}",
      ),
    ],
    category: "出典・検証可能性",
  },
  {
    name: "Uw-unsourced1",
    description: "出典のない加筆に対する初回の案内",
    hasTitle: false,
    defaultTitle: "出典明記のお願い",
    params: [],
    category: "出典・検証可能性",
  },
  {
    name: "Uw-unsourced2",
    description: "出典のない加筆に対する注意",
    hasTitle: false,
    defaultTitle: "出典明記のお願い",
    params: [],
    category: "出典・検証可能性",
  },
  {
    name: "Uw-unsourced3",
    description: "出典のない加筆を続ける利用者への警告",
    hasTitle: false,
    defaultTitle: "警告",
    params: [],
    category: "出典・検証可能性",
  },
  {
    name: "Uw-unsourced4",
    description: "出典のない加筆を続ける利用者への最終警告",
    hasTitle: false,
    defaultTitle: "最終警告",
    params: [],
    category: "出典・検証可能性",
  },
  {
    name: "医学の情報源のお願い",
    description: "医学情報に適した信頼できる二次資料の提示依頼",
    hasTitle: true,
    params: [],
    category: "出典・検証可能性",
  },
  {
    name: "出典除去",
    description: "他の利用者が明記した出典の理由なき除去に対する注意",
    hasTitle: true,
    params: [warnInput("出典を除去した記事", "1", false, "ほげほげ")],
    category: "出典・検証可能性",
  },
  {
    name: "存命人物への無出典記述",
    description: "存命人物記事への無出典記述を除去したことの通知と注意",
    hasTitle: true,
    params: [warnInput("対象となった存命人物記事", "1", true, "ほげほげ")],
    category: "出典・検証可能性",
  },
  {
    name: "二次資料提示のお願い",
    description: "一次資料に依存した投稿への二次資料の提示依頼",
    hasTitle: false,
    defaultTitle: "二次資料を提示してください",
    params: [warnInput("投稿が行われたページ", "1", false, "ほげほげ")],
    category: "出典・検証可能性",
  },
  {
    name: "コピー&ペースト中止のお願い",
    description: "履歴を継承しないコピー&ペーストによる改名の中止依頼",
    hasTitle: true,
    params: [warnInput("ログイン利用者向けの案内を省略", "1", false, "1")],
    category: "著作権・履歴",
  },
  {
    name: "参考文献提示のお願い",
    description: "転載のおそれがある投稿への参考文献の提示依頼",
    hasTitle: true,
    params: [],
    category: "著作権・履歴",
  },
  {
    name: "分割手順の遵守のお願い",
    description: "履歴を継承しない記事分割の中止依頼",
    hasTitle: true,
    params: [warnInput("提出済みの削除依頼名", "1", false, "ほげほげ")],
    category: "著作権・履歴",
  },
  {
    name: "翻訳版補遺のご案内",
    description: "翻訳時の履歴不継承に対する要約欄での補遺方法の案内",
    hasTitle: true,
    params: [
      warnInput("履歴不継承が発生した記事名", "1", true, "ほげほげ"),
      warnInput("新規記事ではなく翻訳加筆", "2", false, "加筆"),
      warnInput("履歴補遺の補足説明を省略", "3", false, "1"),
      warnInput("複数回貼付時の短縮表示", "4", false, "yes"),
    ],
    category: "著作権・履歴",
  },
  {
    name: "履歴不継承",
    description: "要約欄に転記元と版が記載されていない履歴不継承の通知",
    hasTitle: true,
    params: [
      warnInput("履歴不継承が発生した記事名", "1", true, "ほげほげ"),
      warnInput("提出済みの削除依頼名", "2", false, "ほげほげ"),
    ],
    category: "著作権・履歴",
  },
  {
    name: "削除依頼タグ除去",
    description: "削除依頼タグの除去に対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "削除依頼タグが除去されたページ",
        id: "1",
        required: true,
        placeholder: "ほげほげ",
      },
    ],
    category: "削除関係",
  },
  {
    name: "不当な即時削除タグ除去",
    description: "即時削除タグの不当な除去の繰り返しに対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "ページ名",
        id: "1",
        required: true,
        placeholder: "ほげほげ",
      },
    ],
    category: "削除関係",
  },
  {
    name: "即時削除の乱用",
    description: "即時削除の乱用に対する注意",
    hasTitle: true,
    params: [],
    category: "削除関係",
  },
  {
    name: "リンク先削除",
    description: "リンク先の削除に伴う一覧ページからのエントリ除去の通知",
    hasTitle: true,
    params: [
      warnInput("一覧ページ名", "1", true, "ギタリストの一覧"),
      warnInput("削除されたページ名", "2", true, "ほげほげ"),
      warnInput("削除依頼のサブページ名", "3", false, "ほげほげ"),
    ],
    category: "削除関係",
  },
  {
    name: "コモンズへの移動通知",
    description: "ファイルをウィキメディア・コモンズへ移動したことの通知",
    hasTitle: true,
    params: [
      warnInput("日本語版でのファイル名", "1", true, "Example.jpg"),
      warnInput("コモンズでのファイル名", "2", false, "Example.jpg"),
    ],
    category: "画像関係",
  },
  {
    name: "画像のお願い",
    description: "撮影者・出典とライセンス・ファイル名の不備に対する改善依頼",
    hasTitle: true,
    params: [
      warnInput("文言の種類", "1", true, "a / s / n"),
      warnInput("問題のあるファイル名", "2", true, "Example.jpg"),
    ],
    category: "画像関係",
  },
  {
    name: "画像除去",
    description: "他の利用者がアップロードした画像の理由なき除去に対する注意",
    hasTitle: true,
    params: [warnInput("画像を除去した記事", "1", false, "ほげほげ")],
    category: "画像関係",
  },
  {
    name: "Image copyright",
    description: "著作権の状態が不明な画像のアップロードに対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "画像名",
        id: "1",
        required: true,
        placeholder: "ほげほげ.png",
      },
    ],
    category: "画像の著作権",
  },
  {
    name: "Image pubart",
    description: "屋外美術画像のアップロード方針違反に対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "画像名",
        id: "1",
        required: true,
        placeholder: "ほげほげ.png",
      },
    ],
    category: "画像の著作権",
  },
  {
    name: "Image source",
    description: "画像の出典・ライセンス明記を求める注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "画像名",
        id: "1",
        required: true,
        placeholder: "ほげほげ.png",
      },
    ],
    category: "画像の著作権",
  },
  {
    name: "Image URAA",
    description:
      "日本で著作権が消滅し米国で著作権がある画像方針違反に対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "画像名",
        id: "1",
        required: true,
        placeholder: "ほげほげ.png",
      },
    ],
    category: "画像の著作権",
  },
  {
    name: "メールを送りました",
    description: "ウィキメール送信の通知",
    hasTitle: false,
    defaultTitle: "ウィキメールを送りました",
    params: [
      {
        type: "input",
        name: "件名",
        id: "subject",
        required: false,
        placeholder: "ほげほげ",
      },
    ],
    category: "その他",
    nosubst: true,
  },
  {
    name: "警告",
    description: "任意の文章を表示する汎用的な警告ボックス",
    hasTitle: false,
    defaultTitle: "警告",
    params: [warnInput("警告文", "1", true, "ここに警告文を入力")],
    category: "その他",
    nosubst: true,
  },

  // 投稿ブロック通知は管理者権限が必要なため無効
  /*
  {
    name: "3rr",
    description: "過度の差し戻しによる投稿ブロックの通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [warnInput("編集合戦を行ったページ", "1", true, "ほげほげ")],
    category: "投稿ブロック",
  },
  {
    name: "Block-reset",
    description: "ログイン利用者のブロック回避による期間リセットの通知",
    hasTitle: false,
    defaultTitle: "投稿ブロック期間リセットのお知らせ",
    params: [],
    category: "投稿ブロック",
  },
  {
    name: "Block-reset-ip",
    description: "IP利用者のブロック回避による期間リセットの通知",
    hasTitle: false,
    defaultTitle: "投稿ブロック期間リセットのお知らせ",
    params: [],
    category: "投稿ブロック",
  },
  {
    name: "Blocked",
    description: "ログイン利用者への有期ブロックの通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [
      warnInput("投稿ブロック依頼のサブページ名", "1", false, "利用者:例"),
      warnInput("「編集」の代替表現", "2", false, "投稿"),
    ],
    category: "投稿ブロック",
  },
  {
    name: "Blocked-ip",
    description: "IP利用者への有期ブロックの通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [],
    category: "投稿ブロック",
  },
  {
    name: "Checkuserblock-account",
    description: "チェックユーザーによる多重アカウントの無期限ブロック通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [
      warnInput("追加コメント", "1", false, "調査結果に関するコメント"),
      warnInput("署名", "sig", false, "--~~~~"),
    ],
    category: "投稿ブロック",
  },
  {
    name: "Checkuserblock-account/sandbox",
    description: "チェックユーザーによるブロック通知のサンドボックス版",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [
      warnInput("追加コメント", "1", false, "調査結果に関するコメント"),
      warnInput("署名", "sig", false, "--~~~~"),
    ],
    category: "投稿ブロック",
  },
  {
    name: "ILLEGIT",
    description: "多重アカウントの不適切な使用による無期限ブロックの通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [],
    category: "投稿ブロック",
  },
  {
    name: "Infiniteblocked",
    description: "ログイン利用者への無期限ブロックの通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [
      warnInput("投稿ブロック依頼のサブページ名", "1", false, "利用者:例"),
    ],
    category: "投稿ブロック",
  },
  {
    name: "SharedaccountBlocked",
    description: "パスワード公開による共有アカウントの無期限ブロック通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [],
    category: "投稿ブロック",
  },
  {
    name: "Sockblock",
    description: "ブロック回避で作成されたアカウントへの無期限ブロック通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [warnInput("ブロック中のアカウント名", "1", true, "Example")],
    category: "投稿ブロック",
  },
  {
    name: "Sockblock-ip",
    description: "ブロック回避に使用されたIPアドレスへのブロック通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [warnInput("ブロック中のアカウント名", "1", true, "Example")],
    category: "投稿ブロック",
  },
  {
    name: "Spamblocked",
    description: "スパム行為による有期ブロックの通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [
      warnInput("ブロック期間", "1", false, "2週間"),
      warnInput("スパム行為のあったページなど", "2", false, "[[ほげほげ]]で"),
    ],
    category: "投稿ブロック",
  },
  {
    name: "Spamblocked/無期限",
    description: "スパム行為による無期限ブロックの通知",
    hasTitle: false,
    defaultTitle: "投稿ブロックのお知らせ",
    params: [
      warnInput("スパム行為のあったページなど", "1", false, "[[ほげほげ]]で"),
    ],
    category: "投稿ブロック",
  }
  */
] as const satisfies WarnTemplate[];

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
