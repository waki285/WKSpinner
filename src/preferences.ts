import { DEFAULT_OPTIONS, OPTIONS_KEY, Options, SCRIPT_NAME, TIMEZONE_VALUES } from "./constants";
import { getOptionProperty } from "./util";

export async function showConfigPage() {
  const configArea = $("#wkspinner-config-area");
  configArea.empty();
  const title = $("<h2>")
    .text(`${SCRIPT_NAME} 設定`)
    .prop("style", "margin-top:0;");
  configArea.append(title);
  const disableMobile = new OO.ui.CheckboxInputWidget({
    value: "disable-mobile",
    selected: getOptionProperty("disableMobile"),
  });
  const disableMobileField = new OO.ui.FieldLayout(disableMobile, {
    label:
      "モバイルでは全ての機能を無効にする (すべてのモバイル設定を上書きします)",
    align: "inline",
  });
  configArea.append(disableMobileField.$element);

  const prefLinkInToolbar = new OO.ui.CheckboxInputWidget({
    value: "pref-link-in-toolbar",
    selected: getOptionProperty("prefLinkInToolbar"),
  });
  const prefLinkInToolbarField = new OO.ui.FieldLayout(prefLinkInToolbar, {
    label: "この設定ページへのリンクをツールバーに配置する",
    align: "inline",
  });
  configArea.append(prefLinkInToolbarField.$element);

  const useIndividualPortlet = new OO.ui.CheckboxInputWidget({
    value: "use-individual-portlet",
    selected: getOptionProperty("useIndividualPortlet"),
  });
  const useIndividualPortletField = new OO.ui.FieldLayout(useIndividualPortlet, {
    label: "「その他」タブではなく、新たに「WK」というタブを作りそこに機能を配置",
    align: "inline",
    help: "これはモバイルには効果がありません。",
    helpInline: true,
  });
  configArea.append(useIndividualPortletField.$element);

  const versionNotifyOptionAll = new OO.ui.RadioOptionWidget({
    data: "all",
    label: "すべて",
  });
  const versionNotifyOptionMinor = new OO.ui.RadioOptionWidget({
    data: "minor",
    label: "メジャー・マイナーバージョンのみ",
  });
  const versionNotifyOptionNone = new OO.ui.RadioOptionWidget({
    data: "none",
    label: "通知しない",
  });

  const versionNotifySelect = new OO.ui.RadioSelectWidget({
    items: [versionNotifyOptionAll, versionNotifyOptionMinor, versionNotifyOptionNone],
  });

  const versionNotifyField = new OO.ui.FieldLayout(versionNotifySelect, {
    label: "バージョンアップ通知",
    align: "inline",
  });

  configArea.append(versionNotifyField.$element);

  versionNotifySelect.selectItemByData(getOptionProperty("versionNotify"));

  const timezone = new OO.ui.TextInputWidget({
    value: getOptionProperty("timezone"),
    placeholder: "UTC",
  });
  const timezoneField = new OO.ui.FieldLayout(timezone, {
    label: "タイムゾーン",
    align: "top",
    help: "ウィキの個人設定で設定しているものと同じものを設定してください。即時版指定削除機能での時間をUTCに調節するために使用します。現時点ではUTCとJSTのみ使用可能です。",
    helpInline: true,
  });

  configArea.append(timezoneField.$element);

  const historyTimeFormat = new OO.ui.TextInputWidget({
    value: getOptionProperty("historyTimeFormat"),
    placeholder: "(\\d{4})年(\\d{1,2})月(\\d{1,2})日 \\((.)\\) (\\d{2}):(\\d{2})",
  });

  const historyTimeFormatField = new OO.ui.FieldLayout(historyTimeFormat, {
    label: "履歴ページの日時正規表現",
    align: "top",
    help: "履歴ページの日時を取得するための正規表現を設定します。ウィキの言語を日本語にしている限りここを修正する必要はありません。",
    helpInline: true,
  });

  configArea.append(historyTimeFormatField.$element);

  const miFieldset = new OO.ui.FieldsetLayout({
    label: "問題テンプレート貼り付け",
    classes: ["container", "wks-pref-container"],
  });

  const miEnabled = new OO.ui.CheckboxInputWidget({
    value: "mi-enabled",
    selected: getOptionProperty("mi.enabled"),
  });
  const miEnabledField = new OO.ui.FieldLayout(miEnabled, {
    label: "有効にする",
    align: "inline",
  });

  const miEnableMobile = new OO.ui.CheckboxInputWidget({
    value: "mi-enable-mobile",
    selected: getOptionProperty("mi.enableMobile"),
  });
  const miEnableMobileField = new OO.ui.FieldLayout(miEnableMobile, {
    label: "モバイルでも有効にする",
    align: "inline",
  });

  const miSummary = new OO.ui.TextInputWidget({
    value: getOptionProperty("mi.default.summary"),
    placeholder: "+$t",
  });
  const miSummaryField = new OO.ui.FieldLayout(miSummary, {
    label: "編集の要約デフォルト値",
    align: "top",
    help: "$t にはテンプレート名 (複数の問題, 特筆性 etc.) が入ります",
    helpInline: true,
  });

  miFieldset.addItems([miEnabledField, miEnableMobileField, miSummaryField]);

  configArea.append(miFieldset.$element);

  const csdFieldset = new OO.ui.FieldsetLayout({
    label: "即時削除テンプレート貼り付け",
    classes: ["container", "wks-pref-container"],
  });

  const csdEnabled = new OO.ui.CheckboxInputWidget({
    value: "csd-enabled",
    selected: getOptionProperty("csd.enabled"),
  });

  const csdEnabledField = new OO.ui.FieldLayout(csdEnabled, {
    label: "有効にする",
    align: "inline",
  });

  const csdEnableMobile = new OO.ui.CheckboxInputWidget({
    value: "csd-enable-mobile",
    selected: getOptionProperty("csd.enableMobile"),
  });

  const csdEnableMobileField = new OO.ui.FieldLayout(csdEnableMobile, {
    label: "モバイルでも有効にする",
    align: "inline",
  });

  const csdSummary = new OO.ui.TextInputWidget({
    value: getOptionProperty("csd.default.summary"),
    placeholder: "+sd",
  });

  const csdSummaryField = new OO.ui.FieldLayout(csdSummary, {
    label: "編集の要約デフォルト値",
    align: "inline",
  });

  csdFieldset.addItems([
    csdEnabledField,
    csdEnableMobileField,
    csdSummaryField,
  ]);

  configArea.append(csdFieldset.$element);

  const csrdFieldset = new OO.ui.FieldsetLayout({
    label: "即時版指定削除テンプレート貼り付け",
    classes: ["container", "wks-pref-container"],
  });

  const csrdEnabled = new OO.ui.CheckboxInputWidget({
    value: "csrd-enabled",
    selected: getOptionProperty("csrd.enabled"),
  });

  const csrdEnabledField = new OO.ui.FieldLayout(csrdEnabled, {
    label: "有効にする",
    align: "inline",
  });

  const csrdEnableMobile = new OO.ui.CheckboxInputWidget({
    value: "csrd-enable-mobile",
    selected: getOptionProperty("csrd.enableMobile"),
  });

  const csrdEnableMobileField = new OO.ui.FieldLayout(csrdEnableMobile, {
    label: "モバイルでも有効にする",
    align: "inline",
  });

  const csrdSummary = new OO.ui.TextInputWidget({
    value: getOptionProperty("csrd.default.summary"),
    placeholder: "+srd",
  });

  const csrdSummaryField = new OO.ui.FieldLayout(csrdSummary, {
    label: "編集の要約デフォルト値",
    align: "inline",
  });

  csrdFieldset.addItems([
    csrdEnabledField,
    csrdEnableMobileField,
    csrdSummaryField,
  ]);

  configArea.append(csrdFieldset.$element);

  const skjFieldset = new OO.ui.FieldsetLayout({
    label: "削除依頼提出",
    classes: ["container", "wks-pref-container"],
  });

  const skjEnabled = new OO.ui.CheckboxInputWidget({
    value: "skj-enabled",
    selected: getOptionProperty("skj.enabled"),
  });
  const skjEnabledField = new OO.ui.FieldLayout(skjEnabled, {
    label: "有効にする",
    align: "inline",
  });

  const skjEnableMobile = new OO.ui.CheckboxInputWidget({
    value: "skj-enable-mobile",
    selected: getOptionProperty("skj.enableMobile"),
  });
  const skjEnableMobileField = new OO.ui.FieldLayout(skjEnableMobile, {
    label: "モバイルでも有効にする",
    align: "inline",
  });

  const skjOpv = new OO.ui.TextInputWidget({
    value: getOptionProperty("skj.default.opv"),
    placeholder: "{{AFD|削除}} 依頼者票。",
  });
  const skjOpvField = new OO.ui.FieldLayout(skjOpv, {
    label: "依頼者票デフォルト",
    align: "inline",
  });

  const skjSummaryTemplate = new OO.ui.TextInputWidget({
    value: getOptionProperty("skj.default.summaryTemplate"),
    placeholder: "+Sakujo",
  });
  const skjSummaryTemplateField = new OO.ui.FieldLayout(skjSummaryTemplate, {
    label: "編集の要約 (Sakujoテンプレート貼り付け) デフォルト値",
    align: "inline",
  });

  const skjSummarySubmit = new OO.ui.TextInputWidget({
    value: getOptionProperty("skj.default.summarySubmit"),
    placeholder: "削除依頼",
  });
  const skjSummarySubmitField = new OO.ui.FieldLayout(skjSummarySubmit, {
    label: "編集の要約 (削除依頼ページ作成) デフォルト値",
    align: "inline",
  });

  const skjSummaryNote = new OO.ui.TextInputWidget({
    value: getOptionProperty("skj.default.summaryNote"),
    placeholder: "削除依頼の追加",
  });
  const skjSummaryNoteField = new OO.ui.FieldLayout(skjSummaryNote, {
    label: "編集の要約 (削除依頼ページ追記) デフォルト値",
    align: "inline",
    help: "$d には削除依頼ページが入ります (例: Wikipedia:削除依頼/ほげほげ 20240314) $p には削除依頼対象ページが入ります (例: ほげほげ) 三つの要約欄すべてに適用できます",
    helpInline: true,
  });

  const skjSignReason = new OO.ui.CheckboxInputWidget({
    value: "skj-sign-reason",
    selected: getOptionProperty("skj.signReason"),
  });
  const skjSignReasonField = new OO.ui.FieldLayout(skjSignReason, {
    label: "削除依頼理由にも署名する",
    align: "inline",
    help: "削除依頼で、理由部分にも署名をします。この設定をした場合でも、依頼者票部分に署名します。",
    helpInline: true,
  });

  skjFieldset.addItems([
    skjEnabledField,
    skjEnableMobileField,
    skjOpvField,
    skjSummaryTemplateField,
    skjSummarySubmitField,
    skjSummaryNoteField,
    skjSignReasonField,
  ]);

  // プリセット
  const savedPresets = getOptionProperty("skj.opvPresets");

  const items: OO.ui.HorizontalLayout[] = [];

  for (const { name, value } of savedPresets) {
    const button = new OO.ui.ButtonWidget({
      label: "削除",
      flags: ["destructive", "progressive"],
      title: "このプリセットを削除します",
      icon: "trash",
    });
    const item = new OO.ui.HorizontalLayout({
      items: [
        new OO.ui.TextInputWidget({
          value: name,
          placeholder: "ボタンラベル",
          classes: ["wks-pref-preset-name"],
        }),
        new OO.ui.TextInputWidget({
          value: value,
          placeholder: "依頼者票",
        }),
        button,
      ],
      classes: ["wks-pref-preset-horizontal"],
    });
    button.on("click", () => {
      item.$element.remove();
      items.splice(items.indexOf(item), 1);
    });
    items.push(item);
  }

  const skjPresetAdd = new OO.ui.ButtonWidget({
    label: "プリセットを追加",
    flags: ["progressive"],
    title: "プリセットを追加します",
    icon: "add",
    classes: ["wks-mb-4"],
  });

  const skjPresetAddField = new OO.ui.FieldLayout(skjPresetAdd, {
    align: "top",
  });
  const skjPresetFieldset = new OO.ui.FieldsetLayout({
    label: "依頼者票プリセット",
    classes: ["wks-pref-container"],
  });

  skjPresetFieldset.addItems([skjPresetAddField, ...items]);

  skjFieldset.addItems([skjPresetFieldset]);

  configArea.append(skjFieldset.$element);

  skjPresetAdd.on("click", () => {
    const button = new OO.ui.ButtonWidget({
      label: "削除",
      flags: ["destructive", "progressive"],
      title: "このプリセットを削除します",
      icon: "trash",
    });
    const item = new OO.ui.HorizontalLayout({
      items: [
        new OO.ui.TextInputWidget({
          value: "",
          placeholder: "ボタンラベル",
          classes: ["wks-pref-preset-name"],
        }),
        new OO.ui.TextInputWidget({
          value: "",
          placeholder: "依頼者票",
          classes: ["wks-grow"]
        }),
        button,
      ],
      classes: ["wks-pref-preset-horizontal", "wks-w-full"],
    });
    button.on("click", () => {
      item.$element.remove();
      items.splice(items.indexOf(item), 1);
    });
    items.push(item);

    skjPresetFieldset.addItems([item]);
  });

  const ecFieldset = new OO.ui.FieldsetLayout({
    label: "編集回数表示",
    classes: ["container", "wks-pref-container"],
  });

  const ecEnabled = new OO.ui.CheckboxInputWidget({
    value: "ec-enabled",
    selected: getOptionProperty("editCount.enabled"),
  });

  const ecEnabledField = new OO.ui.FieldLayout(ecEnabled, {
    label: "有効にする",
    align: "inline",
    help: "有効にすると、最近の更新、新しいページでユーザー名の右に編集回数が表示されます。",
    helpInline: true,
  });

  const ecEnableMobile = new OO.ui.CheckboxInputWidget({
    value: "ec-enable-mobile",
    selected: getOptionProperty("editCount.enableMobile"),
  });

  const ecEnableMobileField = new OO.ui.FieldLayout(ecEnableMobile, {
    label: "モバイルでも有効にする",
    align: "inline",
  });

  ecFieldset.addItems([
    ecEnabledField,
    ecEnableMobileField,
  ]);

  configArea.append(ecFieldset.$element);

  const warnFieldset = new OO.ui.FieldsetLayout({
    label: "ユーザーへの通知 (旧名称: 警告)",
    classes: ["container", "wks-pref-container"],
  });

  const warnEnabled = new OO.ui.CheckboxInputWidget({
    value: "warn-enabled",
    selected: getOptionProperty("warn.enabled"),
  });

  const warnEnabledField = new OO.ui.FieldLayout(warnEnabled, {
    label: "有効にする",
    align: "inline",
  });

  const warnEnableMobile = new OO.ui.CheckboxInputWidget({
    value: "warn-enable-mobile",
    selected: getOptionProperty("warn.enableMobile"),
  });

  const warnEnableMobileField = new OO.ui.FieldLayout(warnEnableMobile, {
    label: "モバイルでも有効にする",
    align: "inline",
  });

  const warnSummary = new OO.ui.TextInputWidget({
    value: getOptionProperty("warn.default.summary"),
    placeholder: "+$t",
  });
  const warnSummaryField = new OO.ui.FieldLayout(warnSummary, {
    label: "編集の要約デフォルト値",
    align: "top",
    help: "$t にはテンプレート名 (Test, ご自身の記事 etc.) が入ります",
    helpInline: true,
  });

  warnFieldset.addItems([
    warnEnabledField,
    warnEnableMobileField,
    warnSummaryField,
  ]);

  configArea.append(warnFieldset.$element);

  const rfpFieldset = new OO.ui.FieldsetLayout({
    label: "保護依頼",
    classes: ["container", "wks-pref-container"],
  });

  const rfpEnabled = new OO.ui.CheckboxInputWidget({
    value: "rfp-enabled",
    selected: getOptionProperty("rfp.enabled"),
  });

  const rfpEnabledField = new OO.ui.FieldLayout(rfpEnabled, {
    label: "有効にする",
    align: "inline",
  });

  const rfpEnableMobile = new OO.ui.CheckboxInputWidget({
    value: "rfp-enable-mobile",
    selected: getOptionProperty("rfp.enableMobile"),
  });

  const rfpEnableMobileField = new OO.ui.FieldLayout(rfpEnableMobile, {
    label: "モバイルでも有効にする",
    align: "inline",
  });

  const rfpSummarySubmit = new OO.ui.TextInputWidget({
    value: getOptionProperty("rfp.default.summarySubmit"),
    placeholder: "保護依頼",
  });

  const rfpSummarySubmitField = new OO.ui.FieldLayout(rfpSummarySubmit, {
    label: "編集の要約 (保護依頼ページ編集) デフォルト値",
    align: "inline",
    help: "$p には保護依頼対象ページのリンクの羅列が入ります",
    helpInline: true,
  });

  const rfpSummaryTemplate = new OO.ui.TextInputWidget({
    value: getOptionProperty("rfp.default.summaryTemplate"),
    placeholder: "+保護依頼",
  });

  const rfpSummaryTemplateField = new OO.ui.FieldLayout(rfpSummaryTemplate, {
    label: "編集の要約 (保護依頼テンプレート貼り付け) デフォルト値",
    align: "inline",
  });

  rfpFieldset.addItems([
    rfpEnabledField,
    rfpEnableMobileField,
    rfpSummarySubmitField,
    rfpSummaryTemplateField,
  ]);

  configArea.append(rfpFieldset.$element);

  const saveButton = new OO.ui.ButtonWidget({
    label: "保存",
    flags: ["progressive"],
    title: "設定を保存します",
    icon: "check",
  });

  const discardButton = new OO.ui.ButtonWidget({
    label: "設定をリセット",
    flags: ["destructive", "progressive"],
    title: "設定をデフォルトの状態にリセットします",
    icon: "trash",
  });

  const saveButtonsField = new OO.ui.FieldLayout(
    new OO.ui.Widget({
      content: [
        new OO.ui.HorizontalLayout({
          items: [saveButton, discardButton],
        }),
      ],
    }),
    {},
  );
  configArea.append(saveButtonsField.$element);

  saveButton.on("click", () => {
    console.log("Save Button Clicked!!");

    const keys = [...TIMEZONE_VALUES.keys()];

    if (!keys.includes(timezone.getValue())) {
      mw.notify("タイムゾーンが正しくありません。", { type: "error" });
      return;
    }

    saveButton.setDisabled(true);
    discardButton.setDisabled(true);

    const newOptions: Options = {
      disableMobile: disableMobile.isSelected(),
      prefLinkInToolbar: prefLinkInToolbar.isSelected(),
      useIndividualPortlet: useIndividualPortlet.isSelected(),
      versionNotify: (versionNotifySelect.findSelectedItem() as OO.ui.OptionWidget).getData() as string,
      timezone: timezone.getValue() || "UTC",
      historyTimeFormat: historyTimeFormat.getValue() || "(\\d{4})年(\\d{1,2})月(\\d{1,2})日 \\((.)\\) (\\d{2}):(\\d{2})",
      mi: {
        enabled: miEnabled.isSelected(),
        enableMobile: miEnableMobile.isSelected(),
        default: {
          summary: miSummary.getValue() || "",
        },
      },
      csd: {
        enabled: csdEnabled.isSelected(),
        enableMobile: csdEnableMobile.isSelected(),
        default: {
          summary: csdSummary.getValue() || "",
        },
      },
      csrd: {
        enabled: csrdEnabled.isSelected(),
        enableMobile: csrdEnableMobile.isSelected(),
        default: {
          summary: csrdSummary.getValue() || "",
        },
      },
      skj: {
        enabled: skjEnabled.isSelected(),
        enableMobile: skjEnableMobile.isSelected(),
        default: {
          opv: skjOpv.getValue() || "",
          summaryTemplate: skjSummaryTemplate.getValue() || "",
          summarySubmit: skjSummarySubmit.getValue() || "",
          summaryNote: skjSummaryNote.getValue() || "",
        },
        opvPresets: items
          // @ts-expect-error なんか型が合わない
          .filter((item) => item.items[0]?.value && item.items[1]?.value)
          .map((item) => {
            // @ts-expect-error なんか型が合わない
            return { name: item.items[0].value, value: item.items[1].value };
          }),
        signReason: skjSignReason.isSelected(),
      },
      editCount: {
        enabled: ecEnabled.isSelected(),
        enableMobile: ecEnableMobile.isSelected(),
      },
      warn: {
        enabled: warnEnabled.isSelected(),
        enableMobile: warnEnableMobile.isSelected(),
        default: {
          summary: warnSummary.getValue() || "",
        }
      },
      rfp: {
        enabled: rfpEnabled.isSelected(),
        enableMobile: rfpEnableMobile.isSelected(),
        default: {
          summarySubmit: rfpSummarySubmit.getValue() || "",
          summaryTemplate: rfpSummaryTemplate.getValue() || "",
        }
      }
    };
    console.log(newOptions);

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
        saveButton.setDisabled(false);
        discardButton.setDisabled(false);
      });
  });

  discardButton.on("click", () => {
    const c = confirm("初期化しますか？");
    if (!c) return;
    saveButton.setDisabled(true);
    discardButton.setDisabled(true);

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
        saveButton.setDisabled(false);
        discardButton.setDisabled(false);
      });
  });
}
