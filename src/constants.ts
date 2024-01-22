export const DEV = false;

export const SCRIPT_NAME = "WKSpinner";
export const SKJ_REQUEST_PAGE_NAME = DEV
  ? "利用者:鈴音雨/削除依頼テスト/"
  : "Wikipedia:削除依頼/";
export const CONFIG_PAGE_NAME = "利用者:鈴音雨/WKSpinner/Preferences";
export const OPTIONS_KEY = "userjs-wkspinner";
export const SUMMARY_AD =
  " ([[利用者:鈴音雨/WKSpinner|" + SCRIPT_NAME + "]]使用)";
export const SUMMARY_AD_ATTRACT =
  '(<a href="/wiki/利用者:鈴音雨/WKSpinner" target="_blank">' +
  SCRIPT_NAME +
  "</a>使用)";

export type Options = {
  disableMobile: boolean;
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
  };
};

export const DEFAULT_OPTIONS = {
  disableMobile: false,
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
  },
} as const satisfies Options;

export type SDReason = {
  type: string;
  name: string;
  num: number;
  shortDesc: string;
  params: {
    id: number | null;
    name: string;
    placeholder: string;
    required: boolean;
  }[];
  blank: boolean;
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
        name: "コピペ元のページ",
        placeholder: "ほげほげ",
        required: true,
      },
      {
        id: 3,
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
        id: null,
        name: "荒らし利用者",
        placeholder: "利用者名",
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
    shortDesc: "全角と半角の使い分けに反するリダイレクト",
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

export type MIChoice = {
  name: string;
  id: string;
  params: (
    | {
        name: string;
        oneName: string | null;
        id: string;
        type: "select";
        choices: {
          name: string;
          id: string;
        }[];
        required: boolean;
      }
    | { name: string; id: string; type: "input"; required: boolean }
  )[];
};

export const MI_CHOICES = [
  { name: "出典の明記", id: "cite", params: [] },
  { name: "存命人物の出典明記", id: "cite-living", params: [] },
  { name: "存命人物の出典皆無", id: "cite-living-no", params: [] },
  { name: "参照方法", id: "ref", params: [] },
  { name: "脚注の不足", id: "ref-lack", params: [] },
  { name: "未検証", id: "unverified", params: [] },
  { name: "単一の出典", id: "single", params: [] },
  { name: "一次資料", id: "primary", params: [] },
  { name: "精度", id: "cite-accuracy", params: [] },
  { name: "更新", id: "update", params: [] },
  { name: "大言壮語", id: "boast", params: [] },
  { name: "観点", id: "view", params: [] },
  { name: "独自研究", id: "research", params: [] },
  { name: "正確性", id: "accuracy", params: [] },
  { name: "要改訳", id: "translation", params: [] },
  { name: "言葉を濁さない", id: "vague", params: [] },
  {
    name: "特筆性",
    id: "notable",
    params: [
      {
        name: "分野",
        oneName: null,
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
        required: true
      },
    ],
  },
  {
    name: "国際化",
    id: "i18n",
    params: [{ name: "領域", id: "area", type: "input", required: false }],
  },
  { name: "宣伝", id: "advert", params: [] },
  { name: "孤立", id: "orphan", params: [] },
  { name: "Wikify", id: "wikify", params: [] },
  { name: "雑多な内容の箇条書き", id: "list", params: [] },
  { name: "内容過剰", id: "excessive", params: [] },
  { name: "画像過剰", id: "image", params: [] },
  { name: "物語世界内の観点", id: "fictional", params: [] },
] as const satisfies MIChoice[];

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
