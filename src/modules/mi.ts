import {
  ALL_ISSUE_CHOICES,
  MI_CHOICES,
  STANDALONE_ISSUE_CHOICES,
  SCRIPT_NAME,
  SUMMARY_AD,
  SUMMARY_AD_ATTRACT,
  ERRORS,
  ISSUE_TEMPLATE_AREA,
  type IssueTemplateParam,
  type MIChoice,
  type StandaloneIssueChoice,
} from "@/constants";
import {
  buildSelectedIssueTemplates,
  getIssueTemplateParamName,
  partitionMultipleIssueChoices,
} from "@/issue-templates";
import MI_DIALOG_STYLE from "@/styles/mi.css";
import {
  createPortletLink,
  createRowFunc,
  extractIssueTemplates,
  getImage,
  getOptionProperty,
  replaceFirstAndRemoveOtherIssueTemplates,
  type IssueTemplate,
} from "@/util";

type IssueChoice = MIChoice | StandaloneIssueChoice;

const checkboxId = (choice: IssueChoice) => `wks-mi-dialog-type-${choice.id}`;

const paramInputId = (choice: IssueChoice, param: IssueTemplateParam) =>
  `wks-mi-dialog-type-params-${choice.id}-${param.id}`;

export async function initMi() {
  const revisionId = mw.config.get("wgRevisionId");

  const miPortlet = createPortletLink(
    "問題",
    "wks-mi",
    "問題テンプレートを貼り付ける",
  );

  if (!miPortlet) {
    console.warn(`${SCRIPT_NAME}: メニューの作成に失敗しました。`);
    return;
  }

  miPortlet.addEventListener("click", async (e) => {
    e.preventDefault();

    const createRow = createRowFunc("mi");
    const miDialog = $("<div>");
    miDialog.css("max-height", "70vh").dialog({
      dialogClass: "wks-mi-dialog",
      title: `${SCRIPT_NAME} - 問題`,
      resizable: false,
      height: "auto",
      width: `${Math.max(280, Math.min(1180, window.innerWidth - 32))}px`,
      modal: true,
      close: function () {
        $(this).empty().dialog("destroy");
      },
    });
    const dialogContent = $("<div>")
      .prop("id", "wks-mi-dialog-content")
      .text("読み込み中")
      .append(getImage("load", "margin-left: 0.5em;"));
    miDialog.append(dialogContent);
    const pageRes = await new mw.Api().post({
      action: "query",
      format: "json",
      prop: "revisions",
      list: "",
      titles: mw.config.get("wgPageName"),
      formatversion: "2",
      rvprop: "content",
      rvslots: "main",
    });
    const pageContent = pageRes.query.pages[0].revisions[0].slots.main.content;

    const extracted = extractIssueTemplates(pageContent);

    dialogContent.empty();
    const dialogFieldset = $("<fieldset>");
    dialogFieldset.prop({
      id: "wks-mi-dialog-optionfield",
      innerHTML: "<legend>問題テンプレートの貼付・除去</legend>",
    });
    dialogContent.append(dialogFieldset);
    dialogContent.append($("<style>").text(MI_DIALOG_STYLE));

    const getExtractedChoice = (choice: IssueChoice) =>
      extracted.find((template) => template.name === choice.id);

    const getExtractedParamValue = (
      choice: IssueChoice,
      param: IssueTemplateParam,
      template: IssueTemplate,
    ) => {
      const singleName = getIssueTemplateParamName(choice, param);
      return template[param.name] ?? template[singleName];
    };

    const renderChoice = (choice: IssueChoice) => {
      const template = getExtractedChoice(choice);
      const div = $("<div>").addClass("wks-mi-template-item");
      const main = $("<div>").addClass("wks-mi-template-main");
      const isDubious = template?.dubious === "true";
      const checkbox = $("<input>")
        .prop({
          id: checkboxId(choice),
          type: "checkbox",
          checked: template !== undefined,
          disabled: isDubious,
        })
        .attr("data-date", template?.date ?? "");
      main.append(checkbox);
      main.append(
        $("<label>")
          .text(
            template
              ? `${choice.name}${
                  isDubious
                    ? " (特殊なパラメーターが指定されているため WKSpinner で変更できません)"
                    : template.date
                      ? ` (${template.date})`
                      : ""
                }`
              : choice.name,
          )
          .prop("for", checkboxId(choice)),
      );
      div.append(main);
      if (choice.params.length) {
        const paramsId = `${checkboxId(choice)}-params`;
        const params = $("<div>")
          .prop({ id: paramsId, hidden: !checkbox.prop("checked") })
          .addClass("wks-mi-template-params");
        checkbox
          .attr({
            "aria-controls": paramsId,
            "aria-expanded": String(checkbox.prop("checked")),
          })
          .on("change", () => {
            const checked = Boolean(checkbox.prop("checked"));
            params.prop("hidden", !checked);
            checkbox.attr("aria-expanded", String(checked));
          });
        for (const param of choice.params) {
          params.append(
            $("<label>")
              .html(
                `${param.name}${
                  !("category" in choice) && param.multipleName === null
                    ? " (単独時のみ)"
                    : ""
                }${param.required ? ' <span class="wks-red">*</span>' : ""}: `,
              )
              .prop("for", paramInputId(choice, param))
              .addClass("wks-shrink-0"),
          );
          let input: JQuery;
          switch (param.type) {
            case "select":
              input = $("<select>");
              // eslint-disable-next-line no-case-declarations
              const options: Map<string, string> = new Map();
              for (const choice of param.choices) {
                input.append(
                  $("<option>").prop({ value: choice.id, text: choice.name }),
                );
                const templateValue = choice.value ?? choice.name;
                options.set(templateValue, choice.id);
                options.set(templateValue.toLowerCase(), choice.id);
              }
              if (template) {
                const extractedValue = getExtractedParamValue(
                  choice,
                  param,
                  template,
                );
                input.val(
                  extractedValue === undefined
                    ? param.choices[0]!.id
                    : (options.get(extractedValue) ??
                        options.get(extractedValue.toLowerCase()) ??
                        param.choices[0]!.id),
                );
              }
              break;
            case "input":
              input = $("<input>").prop({
                type: "text",
                value: template
                  ? (getExtractedParamValue(choice, param, template) ?? "")
                  : "",
                placeholder: param.placeholder ?? "",
              });
              break;
          }
          params.append(
            input.prop({
              id: paramInputId(choice, param),
              required: param.required,
            }),
          );
        }
        div.append(params);
      }
      return div;
    };

    const dialogTypeRow = createRow("type");
    const multipleColumn = $("<section>").addClass("wks-mi-template-column");
    multipleColumn.append($("<h3>").text("複数の問題にまとめ可"));
    for (const choice of MI_CHOICES) {
      multipleColumn.append(renderChoice(choice));
    }
    const standaloneColumn = $("<section>").addClass("wks-mi-template-column");
    standaloneColumn.append($("<h3>").text("単独で貼り付け"));
    const categories = [
      ...new Set(STANDALONE_ISSUE_CHOICES.map(({ category }) => category)),
    ];
    for (const category of categories) {
      const group = $("<section>").addClass("wks-mi-template-group");
      group.append($("<h4>").text(category));
      for (const choice of STANDALONE_ISSUE_CHOICES.filter(
        (item) => item.category === category,
      )) {
        group.append(renderChoice(choice));
      }
      standaloneColumn.append(group);
    }

    dialogTypeRow.append(multipleColumn, standaloneColumn);
    dialogFieldset.append(dialogTypeRow);

    const dialogSummary = createRow("summary");
    dialogSummary.append(
      $("<label>")
        .html(
          `編集の要約 (指定しない場合 "+複数の問題" もしくは単一の場合テンプレート名) "${SUMMARY_AD_ATTRACT}" が自動付加されます`,
        )
        .prop("for", "wks-mi-dialog-summary-input"),
    );
    dialogSummary.append(
      $("<input>").prop({
        id: "wks-mi-dialog-summary-input",
        type: "text",
        placeholder: "+複数の問題",
        style: "width: 100%;",
        value: getOptionProperty("mi.default.summary"),
      }),
    );

    dialogFieldset.append(dialogSummary);

    const isChecked = (choice: IssueChoice, includeDisabled = false) =>
      Boolean(
        $(
          `#${checkboxId(choice)}${includeDisabled ? "" : ":not(:disabled)"}`,
        ).prop("checked"),
      );

    const getParamValues = (choice: IssueChoice) =>
      Object.fromEntries(
        choice.params.map((param) => [
          param.id,
          String($(`#${paramInputId(choice, param)}`).val() ?? ""),
        ]),
      );

    const getFinalContent = () => {
      const date = `${new Date().getFullYear()}年${new Date().getMonth() + 1}月`;
      const selectedMultiple = MI_CHOICES.filter((choice) => isChecked(choice));
      const selectedStandalone = STANDALONE_ISSUE_CHOICES.filter((choice) =>
        isChecked(choice),
      );
      const values = Object.fromEntries(
        ALL_ISSUE_CHOICES.map((choice) => [choice.id, getParamValues(choice)]),
      );
      const dates = Object.fromEntries(
        ALL_ISSUE_CHOICES.map((choice) => [
          choice.id,
          $(`#${checkboxId(choice)}`).attr("data-date") || date,
        ]),
      );
      const templates = buildSelectedIssueTemplates(
        selectedMultiple,
        selectedStandalone,
        values,
        dates,
      );

      return replaceFirstAndRemoveOtherIssueTemplates(pageContent).replace(
        ISSUE_TEMPLATE_AREA,
        templates.length ? `${templates.join("\n")}\n` : "",
      );
    };

    const getFinalSummary = () => {
      const selectedMultiple = MI_CHOICES.filter((choice) =>
        isChecked(choice, true),
      );
      const values = Object.fromEntries(
        selectedMultiple.map((choice) => [choice.id, getParamValues(choice)]),
      );
      const { groupable, standalone: separatedChoices } =
        partitionMultipleIssueChoices(selectedMultiple, values);
      const templateNames = [
        ...(groupable.length >= 2
          ? ["複数の問題"]
          : groupable.map(({ name }) => name)),
        ...separatedChoices.map(({ name }) => name),
        ...STANDALONE_ISSUE_CHOICES.filter((choice) =>
          isChecked(choice, true),
        ).map(({ name }) => name),
      ];
      const tlName = templateNames.length
        ? templateNames.join("、")
        : "問題テンプレートを除去";
      return (
        (($("#wks-mi-dialog-summary-input").val() as string).replaceAll(
          "$t",
          tlName,
        ) || `+${tlName}`) + SUMMARY_AD
      );
    };

    const checkParams = () => {
      const errList = $("<ul>");

      for (const choice of ALL_ISSUE_CHOICES) {
        if (isChecked(choice)) {
          const params = choice.params;
          for (const choiceParam of params) {
            const param: IssueTemplateParam = choiceParam;
            if (param.required) {
              const val = $(`#${paramInputId(choice, param)}`).val();
              if (param.type === "select" && val === "null") {
                errList.append(
                  $("<li>").text(
                    `${choice.name}の${param.name}が選択されていません。`,
                  ),
                );
              } else if (param.type === "input" && val === "") {
                errList.append(
                  $("<li>").text(
                    `${choice.name}の${param.name}が入力されていません。`,
                  ),
                );
              }
            }
          }
        }
      }

      const notEncyclopedic = MI_CHOICES.find(
        (choice) => choice.id === "not-encyclopedic" && isChecked(choice),
      );
      if (notEncyclopedic) {
        const values = getParamValues(notEncyclopedic);
        if (values.type && values.type !== "null" && values.text) {
          errList.append(
            $("<li>").text(
              "百科事典的でないのタイプとカスタムテキストは併用できません",
            ),
          );
        }
      }

      if (errList.children().length) {
        return $("<div>")
          .append($("<p>").text("入力にエラーがあります。"))
          .append(errList);
      } else {
        return false;
      }
    };

    const preview = async () => {
      const err = checkParams();
      if (err) {
        mw.notify(err, { type: "error" });
        return;
      }
      const previewDialog = $("<div>")
        .css({
          maxHeight: "70vh",
          maxWidth: "80vw",
        })
        .dialog({
          dialogClass: "wks-mi-dialog wks-mi-dialog-preview",
          title: `${SCRIPT_NAME} - 問題プレビュー`,
          height: "auto",
          width: "auto",
          modal: true,
          close: function () {
            $(this).empty().dialog("destroy");
          },
        });
      const previewContent = $("<div>")
        .prop("id", "anr-dialog-preview-content")
        .text("読み込み中")
        .append(getImage("load", "margin-left: 0.5em;"));
      previewDialog.append(previewContent);
      const parseRes = await new mw.Api().post({
        action: "parse",
        title: mw.config.get("wgPageName"),
        text: getFinalContent(),
        summary: getFinalSummary(),
        prop: "text|modules|jsconfigvars",
        pst: true,
        disablelimitreport: true,
        disableeditsection: true,
        disabletoc: true,
        formatversion: "2",
      });
      previewContent.empty();
      if (parseRes.parse.modules.length) {
        mw.loader.load(parseRes.parse.modules);
      }
      if (parseRes.parse.modulestyles.length) {
        mw.loader.load(parseRes.parse.modulestyles);
      }
      const summaryPreview = $("<div>")
        .html(parseRes.parse.parsedsummary)
        .prop("id", "wks-mi-dialog-preview-summary");
      const hr = $("<hr>").addClass("wks-hr");
      const previewDiv = $("<div>")
        .html(parseRes.parse.text)
        .prop("id", "wks-mi-dialog-preview-div")
        .addClass("wks-dialog-preview-div");
      previewContent.append(summaryPreview);
      previewContent.append(hr);
      previewContent.append(previewDiv);
      previewDialog.dialog({
        position: {
          my: "center",
          at: "center",
          of: window,
        },
      });
    };

    const execute = async () => {
      try {
        const editRes = await new mw.Api().postWithEditToken({
          action: "edit",
          title: mw.config.get("wgPageName"),
          nocreate: 1,
          text: getFinalContent(),
          summary: getFinalSummary(),
          formatversion: "2",
          baserevid: revisionId,
        });
        if (editRes.edit.result === "Success") {
          mw.notify("ページの編集に成功しました。");
          miDialog.dialog("close");
          window.location.reload();
        } else {
          mw.notify(
            // @ts-expect-error index get
            "エラー: " + ERRORS[editRes.error?.code] || editRes.error?.info,
          );
        }
      } catch (e) {
        // @ts-expect-error index get
        mw.notify("エラー: " + ERRORS[e.toString()] || e.toString());
      }
    };

    miDialog.dialog({
      buttons: [
        {
          text: "実行",
          click: function () {
            return execute();
          },
        },
        {
          text: "プレビュー",
          click: function () {
            return preview();
          },
        },
        {
          text: "閉じる",
          click: function () {
            return miDialog.dialog("close");
          },
        },
      ],
    });

    miDialog.dialog({
      position: {
        my: "top",
        at: "top+5%",
        of: window,
      },
    });
  });
}
