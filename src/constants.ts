export const DEV = false;

// 変更必須
export const VERSION = "0.8.0";

export const SCRIPT_NAME = "WKSpinner";
export const SKJ_REQUEST_PAGE_NAME = DEV
  ? "利用者:鈴音雨/削除依頼テスト/"
  : "Wikipedia:削除依頼/";
export const CONFIG_PAGE_NAME = "利用者:鈴音雨/WKSpinner/Preferences";
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

export type Options = {
  disableMobile: boolean;
  prefLinkInToolbar: boolean;
  useIndividualPortlet: boolean;
  versionNotify: string;
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
};

export const DEFAULT_OPTIONS = {
  disableMobile: false,
  prefLinkInToolbar: true,
  useIndividualPortlet: false,
  versionNotify: "all",
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
      summary: "$t",
    }
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

export type MIChoice = {
  name: string;
  id: string;
  aliases?: string[];
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
  { name: "出典の明記", id: "cite", params: [], aliases: ["references"] },
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
        required: false,
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

export type WarnTemplate = {
  name: string;
  description: string;
  params: {
    type: "input",
    name: string;
    id: string;
    required: boolean;
    placeholder: string;
    defaultValue?: string;
  }[],
  category: string;
} & ({ hasTitle: true } | { hasTitle: false, defaultTitle: string });

export const WARN_TEMPLATES = [
  {
    name: "Welcome",
    description: "新規利用者への歓迎",
    hasTitle: false,
    defaultTitle: "ウィキペディアへようこそ！",
    params: [
      {
        type: "input",
        name: "署名",
        id: "1",
        required: true,
        placeholder: "--~~~~",
        defaultValue: "--~~~~",
      }
    ],
    category: "ようこそ"
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
      }
    ],
    category: "Test (一般的なテストもしくは荒らし)"
  },
  {
    name: "Selftest",
    description: "テスト投稿を自分で差し戻した人に対しての案内",
    hasTitle: false,
    defaultTitle: "ご案内",
    params: [],
    category: "Test (一般的なテストもしくは荒らし)"
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
      }
    ],
    category: "Test (一般的なテストもしくは荒らし)"
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
      }
    ],
    category: "Test (一般的なテストもしくは荒らし)"
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
      }
    ],
    category: "Test (一般的なテストもしくは荒らし)"
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
      }
    ],
    category: "Test (一般的なテストもしくは荒らし)"
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
      }
    ],
    category: "Test (一般的なテストもしくは荒らし)"
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
      }
    ],
    category: "一括投稿・プレビュー"
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
      }
    ],
    category: "一括投稿・プレビュー"
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
      }
    ],
    category: "一括投稿・プレビュー"
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
      }
    ],
    category: "一括投稿・プレビュー"
  },
  {
    name: "Sign",
    description: "署名の案内",
    hasTitle: true,
    params: [],
    category: "コミュニケーション関係"
  },
  {
    name: "個人攻撃",
    description: "利用者に対する個人攻撃の警告",
    hasTitle: true,
    params: [],
    category: "コミュニケーション関係"
  },
  {
    name: "編集合戦",
    description: "編集合戦への警告",
    hasTitle: false,
    defaultTitle: "編集合戦はおやめください",
    params: [],
    category: "コミュニケーション関係"
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
      }
    ],
    category: "コミュニケーション関係"
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
      }
    ],
    category: "投稿内容関係"
  },
  {
    name: "対話拒否",
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
      }
    ],
    category: "コミュニケーション関係"
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
      }
    ],
    category: "投稿内容関係"
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
      }
    ],
    category: "投稿内容関係"
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
      }
    ],
    category: "投稿内容関係"
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
        placeholder: "「アルコール使用は主に男の人口の間で高かった」「急いで混雑していました」",
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
      }
    ],
    category: "投稿内容関係"
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
      }
    ],
    category: "コミュニケーション関係"
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
      }
    ],
    category: "投稿内容関係"
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
      }
    ],
    category: "投稿内容関係"
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
      }
    ],
    category: "削除関係"
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
      }
    ],
    category: "投稿内容関係"
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
      }
    ],
    category: "投稿内容関係"
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
      }
    ],
    category: "削除関係"
  },
  {
    name: "即時削除の乱用",
    description: "即時削除の乱用に対する注意",
    hasTitle: true,
    params: [],
    category: "削除関係"
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
      }
    ],
    category: "投稿内容関係"
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
      }
    ],
    category: "投稿内容関係"
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
      }
    ],
    category: "画像の著作権"
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
      }
    ],
    category: "画像の著作権"
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
      }
    ],
    category: "画像の著作権"
  },
  {
    name: "Image URAA",
    description: "日本で著作権が消滅し米国で著作権がある画像方針違反に対する注意",
    hasTitle: true,
    params: [
      {
        type: "input",
        name: "画像名",
        id: "1",
        required: true,
        placeholder: "ほげほげ.png",
      }
    ],
    category: "画像の著作権"
  }
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
