import {
  DEFAULT_OPTIONS,
  OPTIONS_KEY,
  type Options,
  SCRIPT_NAME,
  TIMEZONE_VALUES,
} from "./constants";
import { getOptionProperty } from "./util";

type VueModule = {
  createApp: (root: unknown, props?: Record<string, unknown>) => VueApp;
  h: (
    type: unknown,
    props?: Record<string, unknown> | null,
    children?: unknown,
  ) => unknown;
  ref: <T>(value: T) => { value: T };
};
type VueApp = {
  mount: (target: HTMLElement) => unknown;
  unmount: () => void;
};
type CodexModule = {
  CdxField: unknown;
  CdxCheckbox: unknown;
  CdxTextInput: unknown;
  CdxButton: unknown;
  CdxRadio: unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequireFn = (name: string) => any;
const requireKey = Symbol.for("wkspinner.codex.require");

function waitForCodex(): Promise<RequireFn> {
  return new Promise((resolve, reject) => {
    mw.loader.using(
      ["vue", "@wikimedia/codex"],
      (require: RequireFn) => {
        (globalThis as Record<symbol, unknown>)[requireKey] = require;
        resolve(require);
      },
      reject,
    );
  });
}

async function getRequire(): Promise<RequireFn> {
  const cached = (globalThis as Record<symbol, unknown>)[requireKey] as
    RequireFn | undefined;
  if (cached) {
    return cached;
  }
  return waitForCodex();
}

type Preset = { name: string; value: string };

export async function showConfigPage() {
  const Vue = (await getRequire())("vue") as VueModule;
  const Codex = (await getRequire())("@wikimedia/codex") as CodexModule;
  const { CdxField, CdxCheckbox, CdxTextInput, CdxButton, CdxRadio } = Codex;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const h: any = Vue.h;

  const configArea = document.getElementById("wkspinner-config-area");
  if (!configArea) {
    console.warn(`${SCRIPT_NAME}: 設定エリアが見つかりません`);
    return;
  }
  configArea.innerHTML = "";

  const host = document.createElement("div");
  configArea.append(host);

  const options = {
    disableMobile: Vue.ref(getOptionProperty("disableMobile") === true),
    prefLinkInToolbar: Vue.ref(getOptionProperty("prefLinkInToolbar") === true),
    useIndividualPortlet: Vue.ref(
      getOptionProperty("useIndividualPortlet") === true,
    ),
    useCodexModal: Vue.ref(getOptionProperty("useCodexModal") === true),
    versionNotify: Vue.ref(String(getOptionProperty("versionNotify") ?? "all")),
    timezone: Vue.ref(String(getOptionProperty("timezone") ?? "UTC")),
    historyTimeFormat: Vue.ref(
      String(
        getOptionProperty("historyTimeFormat") ??
          "(\\d{4})年(\\d{1,2})月(\\d{1,2})日 \\((.)\\) (\\d{2}):(\\d{2})",
      ),
    ),
    wikidataEnabled: Vue.ref(getOptionProperty("wikidata.enabled") === true),
    miEnabled: Vue.ref(getOptionProperty("mi.enabled") === true),
    miEnableMobile: Vue.ref(getOptionProperty("mi.enableMobile") === true),
    miSummary: Vue.ref(String(getOptionProperty("mi.default.summary") ?? "")),
    csdEnabled: Vue.ref(getOptionProperty("csd.enabled") === true),
    csdEnableMobile: Vue.ref(getOptionProperty("csd.enableMobile") === true),
    csdSummary: Vue.ref(String(getOptionProperty("csd.default.summary") ?? "")),
    csrdEnabled: Vue.ref(getOptionProperty("csrd.enabled") === true),
    csrdEnableMobile: Vue.ref(getOptionProperty("csrd.enableMobile") === true),
    csrdSummary: Vue.ref(
      String(getOptionProperty("csrd.default.summary") ?? ""),
    ),
    skjEnabled: Vue.ref(getOptionProperty("skj.enabled") === true),
    skjEnableMobile: Vue.ref(getOptionProperty("skj.enableMobile") === true),
    skjOpv: Vue.ref(String(getOptionProperty("skj.default.opv") ?? "")),
    skjSummaryTemplate: Vue.ref(
      String(getOptionProperty("skj.default.summaryTemplate") ?? ""),
    ),
    skjSummarySubmit: Vue.ref(
      String(getOptionProperty("skj.default.summarySubmit") ?? ""),
    ),
    skjSummaryNote: Vue.ref(
      String(getOptionProperty("skj.default.summaryNote") ?? ""),
    ),
    skjSignReason: Vue.ref(getOptionProperty("skj.signReason") === true),
    ecEnabled: Vue.ref(getOptionProperty("editCount.enabled") === true),
    ecEnableMobile: Vue.ref(
      getOptionProperty("editCount.enableMobile") === true,
    ),
    warnEnabled: Vue.ref(getOptionProperty("warn.enabled") === true),
    warnEnableMobile: Vue.ref(getOptionProperty("warn.enableMobile") === true),
    warnSummary: Vue.ref(
      String(getOptionProperty("warn.default.summary") ?? ""),
    ),
    rfpEnabled: Vue.ref(getOptionProperty("rfp.enabled") === true),
    rfpEnableMobile: Vue.ref(getOptionProperty("rfp.enableMobile") === true),
    rfpSummarySubmit: Vue.ref(
      String(getOptionProperty("rfp.default.summarySubmit") ?? ""),
    ),
    rfpSummaryTemplate: Vue.ref(
      String(getOptionProperty("rfp.default.summaryTemplate") ?? ""),
    ),
  };

  const saving = Vue.ref(false);
  const presets = Vue.ref<Preset[]>(
    (getOptionProperty("skj.opvPresets") as Preset[] | undefined)?.map((p) => ({
      ...p,
    })) ?? [],
  );

  const addPreset = () => {
    presets.value.push({ name: "", value: "" });
  };
  const removePreset = (index: number) => {
    presets.value.splice(index, 1);
  };

  const save = () => {
    const keys = [...TIMEZONE_VALUES.keys()];
    if (!keys.includes(options.timezone.value)) {
      mw.notify("タイムゾーンが正しくありません。", { type: "error" });
      return;
    }
    saving.value = true;
    const newOptions: Options = {
      disableMobile: options.disableMobile.value,
      prefLinkInToolbar: options.prefLinkInToolbar.value,
      useIndividualPortlet: options.useIndividualPortlet.value,
      useCodexModal: options.useCodexModal.value,
      versionNotify: options.versionNotify.value,
      timezone: options.timezone.value || "UTC",
      historyTimeFormat:
        options.historyTimeFormat.value ||
        "(\\d{4})年(\\d{1,2})月(\\d{1,2})日 \\((.)\\) (\\d{2}):(\\d{2})",
      wikidata: { enabled: options.wikidataEnabled.value },
      mi: {
        enabled: options.miEnabled.value,
        enableMobile: options.miEnableMobile.value,
        default: { summary: options.miSummary.value || "" },
      },
      csd: {
        enabled: options.csdEnabled.value,
        enableMobile: options.csdEnableMobile.value,
        default: { summary: options.csdSummary.value || "" },
      },
      csrd: {
        enabled: options.csrdEnabled.value,
        enableMobile: options.csrdEnableMobile.value,
        default: { summary: options.csrdSummary.value || "" },
      },
      skj: {
        enabled: options.skjEnabled.value,
        enableMobile: options.skjEnableMobile.value,
        default: {
          opv: options.skjOpv.value || "",
          summaryTemplate: options.skjSummaryTemplate.value || "",
          summarySubmit: options.skjSummarySubmit.value || "",
          summaryNote: options.skjSummaryNote.value || "",
        },
        opvPresets: presets.value.filter((p) => p.name && p.value),
        signReason: options.skjSignReason.value,
      },
      editCount: {
        enabled: options.ecEnabled.value,
        enableMobile: options.ecEnableMobile.value,
      },
      warn: {
        enabled: options.warnEnabled.value,
        enableMobile: options.warnEnableMobile.value,
        default: { summary: options.warnSummary.value || "" },
      },
      rfp: {
        enabled: options.rfpEnabled.value,
        enableMobile: options.rfpEnableMobile.value,
        default: {
          summarySubmit: options.rfpSummarySubmit.value || "",
          summaryTemplate: options.rfpSummaryTemplate.value || "",
        },
      },
    };
    new mw.Api()
      .postWithEditToken({
        action: "options",
        format: "json",
        optionname: OPTIONS_KEY,
        optionvalue: JSON.stringify(newOptions),
        formatversion: "2",
      })
      .then(() => {
        mw.notify("セーブしました。");
        location.reload();
      })
      .catch(() => {
        mw.notify("セーブに失敗しました");
        saving.value = false;
      });
  };

  const reset = () => {
    if (!confirm("初期化しますか？")) return;
    saving.value = true;
    new mw.Api()
      .postWithEditToken({
        action: "options",
        format: "json",
        optionname: OPTIONS_KEY,
        optionvalue: JSON.stringify(DEFAULT_OPTIONS),
        formatversion: "2",
      })
      .then(() => {
        mw.notify("初期化しました。");
        location.reload();
      })
      .catch(() => {
        mw.notify("初期化に失敗しました。");
        saving.value = false;
      });
  };

  // Helper render functions
  const checkboxField = (
    model: { value: boolean },
    label: string,
    help?: string,
  ) =>
    h(
      CdxCheckbox,
      {
        modelValue: model.value,
        "onUpdate:modelValue": (v: boolean) => {
          model.value = v;
        },
      },
      {
        default: () => label,
        ...(help ? { description: () => help } : {}),
      },
    );

  const textField = (
    model: { value: string },
    label: string,
    placeholder: string,
    help?: string,
  ) =>
    h(CdxField, null, {
      default: () =>
        h(CdxTextInput, {
          modelValue: model.value,
          "onUpdate:modelValue": (v: string) => {
            model.value = v;
          },
          placeholder,
        }),
      label: () => label,
      ...(help ? { description: () => help } : {}),
    });

  const radioField = (
    model: { value: string },
    label: string,
    choices: { value: string; label: string }[],
  ) =>
    h(
      CdxField,
      { isFieldset: true },
      {
        label: () => label,
        default: () =>
          choices.map((c) =>
            h(
              CdxRadio,
              {
                modelValue: model.value,
                "onUpdate:modelValue": (v: string) => {
                  model.value = v;
                },
                inputValue: c.value,
                name: "version-notify",
              },
              () => c.label,
            ),
          ),
      },
    );

  const panel = (label: string, content: unknown[]) =>
    h(
      CdxField,
      { isFieldset: true },
      {
        label: () => label,
        default: () => content,
      },
    );

  const app = Vue.createApp({
    setup() {
      return () =>
        h("div", [
          h("h2", { style: "margin-top:0;" }, `${SCRIPT_NAME} 設定`),
          h("div", { style: "display:flex;flex-direction:column;gap:0.5rem;" }, [
            checkboxField(
              options.disableMobile,
              "モバイルでは全ての機能を無効にする (すべてのモバイル設定を上書きします)",
            ),
            checkboxField(
              options.prefLinkInToolbar,
              "この設定ページへのリンクをツールバーに配置する",
            ),
            checkboxField(
              options.useIndividualPortlet,
              "「その他」タブではなく、新たに「WK」というタブを作りそこに機能を配置",
              "これはモバイルには効果がありません。",
            ),
            checkboxField(
              options.useCodexModal,
              "モダンなモーダルを使用する (β版)",
              "Codex を利用したダイアログに置き換えます。実験的機能です。",
            ),
            radioField(options.versionNotify, "バージョンアップ通知", [
              { value: "all", label: "すべて" },
              { value: "minor", label: "メジャー・マイナーバージョンのみ" },
              { value: "none", label: "通知しない" },
            ]),
            textField(
              options.timezone,
              "タイムゾーン",
              "UTC",
              "ウィキの個人設定で設定しているものと同じものを設定してください。即時版指定削除機能での時間をUTCに調節するために使用します。現時点ではUTCとJSTのみ使用可能です。",
            ),
            textField(
              options.historyTimeFormat,
              "履歴ページの日時正規表現",
              "(\\d{4})年(\\d{1,2})月(\\d{1,2})日 \\((.)\\) (\\d{2}):(\\d{2})",
              "履歴ページの日時を取得するための正規表現を設定します。ウィキの言語を日本語にしている限りここを修正する必要はありません。",
            ),
            panel("ウィキデータ説明表示", [
              checkboxField(
                options.wikidataEnabled,
                "PC版のページ見出しにウィキデータの日本語説明を表示する",
              ),
            ]),
            panel("問題テンプレート貼り付け", [
              checkboxField(options.miEnabled, "有効にする"),
              checkboxField(options.miEnableMobile, "モバイルでも有効にする"),
              textField(
                options.miSummary,
                "編集の要約デフォルト値",
                "+{{$t}}",
                "$t には最大5件のテンプレート名、$s1 には1件目のテンプレート名が入ります",
              ),
            ]),
            panel("即時削除テンプレート貼り付け", [
              checkboxField(options.csdEnabled, "有効にする"),
              checkboxField(options.csdEnableMobile, "モバイルでも有効にする"),
              textField(options.csdSummary, "編集の要約デフォルト値", "+sd"),
            ]),
            panel("即時版指定削除テンプレート貼り付け", [
              checkboxField(options.csrdEnabled, "有効にする"),
              checkboxField(options.csrdEnableMobile, "モバイルでも有効にする"),
              textField(options.csrdSummary, "編集の要約デフォルト値", "+srd"),
            ]),
            panel("削除依頼提出", [
              checkboxField(options.skjEnabled, "有効にする"),
              checkboxField(options.skjEnableMobile, "モバイルでも有効にする"),
              textField(
                options.skjOpv,
                "依頼者票デフォルト",
                "{{AFD|削除}} 依頼者票。",
              ),
              textField(
                options.skjSummaryTemplate,
                "編集の要約 (Sakujoテンプレート貼り付け) デフォルト値",
                "+Sakujo",
              ),
              textField(
                options.skjSummarySubmit,
                "編集の要約 (削除依頼ページ作成) デフォルト値",
                "削除依頼",
              ),
              textField(
                options.skjSummaryNote,
                "編集の要約 (削除依頼ページ追記) デフォルト値",
                "削除依頼の追加",
                "$d には削除依頼ページが入ります (例: Wikipedia:削除依頼/ほげほげ 20240314) $p には削除依頼対象ページが入ります (例: ほげほげ) 三つの要約欄すべてに適用できます",
              ),
              checkboxField(
                options.skjSignReason,
                "削除依頼理由にも署名する",
                "削除依頼で、理由部分にも署名をします。この設定をした場合でも、依頼者票部分に署名します。",
              ),
              h(
                CdxField,
                { isFieldset: true },
                {
                  label: () => "依頼者票プリセット",
                  default: () => [
                    h(
                      CdxButton,
                      {
                        action: "progressive",
                        weight: "normal",
                        onClick: addPreset,
                      },
                      () => "プリセットを追加",
                    ),
                    ...presets.value.map((p, i) =>
                      h(
                        "div",
                        {
                          style:
                            "display:flex;gap:0.5rem;align-items:center;margin-top:0.5rem;",
                        },
                        [
                          h(CdxTextInput, {
                            modelValue: p.name,
                            "onUpdate:modelValue": (v: string) => {
                              p.name = v;
                            },
                            placeholder: "ボタンラベル",
                          }),
                          h(CdxTextInput, {
                            modelValue: p.value,
                            "onUpdate:modelValue": (v: string) => {
                              p.value = v;
                            },
                            placeholder: "依頼者票",
                          }),
                          h(
                            CdxButton,
                            {
                              action: "destructive",
                              weight: "quiet",
                              onClick: () => removePreset(i),
                            },
                            () => "削除",
                          ),
                        ],
                      ),
                    ),
                  ],
                },
              ),
            ]),
            panel("編集回数表示", [
              checkboxField(
                options.ecEnabled,
                "有効にする",
                "有効にすると、最近の更新、新しいページでユーザー名の右に編集回数が表示されます。",
              ),
              checkboxField(options.ecEnableMobile, "モバイルでも有効にする"),
            ]),
            panel("ユーザーへの通知 (旧名称: 警告)", [
              checkboxField(options.warnEnabled, "有効にする"),
              checkboxField(options.warnEnableMobile, "モバイルでも有効にする"),
              textField(
                options.warnSummary,
                "編集の要約デフォルト値",
                "+$t",
                "$t にはテンプレート名 (Test, ご自身の記事 etc.) が入ります",
              ),
            ]),
            panel("保護依頼", [
              checkboxField(options.rfpEnabled, "有効にする"),
              checkboxField(options.rfpEnableMobile, "モバイルでも有効にする"),
              textField(
                options.rfpSummarySubmit,
                "編集の要約 (保護依頼ページ編集) デフォルト値",
                "保護依頼",
                "$p には保護依頼対象ページのリンクの羅列が入ります",
              ),
              textField(
                options.rfpSummaryTemplate,
                "編集の要約 (保護依頼テンプレート貼り付け) デフォルト値",
                "+保護依頼",
              ),
            ]),
            h("div", { style: "display:flex;gap:0.5rem;margin-top:1rem;" }, [
              h(
                CdxButton,
                {
                  action: "progressive",
                  weight: "primary",
                  disabled: saving.value,
                  onClick: save,
                },
                () => "保存",
              ),
              h(
                CdxButton,
                {
                  action: "destructive",
                  weight: "normal",
                  disabled: saving.value,
                  onClick: reset,
                },
                () => "設定をリセット",
              ),
            ]),
          ]),
        ]);
    },
  });

  app.mount(host);
}
