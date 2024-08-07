import {
  MI_CHOICES,
  SCRIPT_NAME,
  SUMMARY_AD,
  SUMMARY_AD_ATTRACT,
  ERRORS,
  ISSUE_TEMPLATE_AREA,
} from "@/constants";
import {
  createPortletLink,
  createRowFunc,
  extractIssueTemplates,
  getImage,
  getOptionProperty,
  replaceFirstAndRemoveOtherIssueTemplates,
} from "@/util";

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
      width: "auto",
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
    const dialogTypeRow = createRow("type");
    for (const choice of MI_CHOICES) {
      const div = $("<div>").addClass("wks-inline");
      div.append(
        $("<input>")
          .prop({
            id: `wks-mi-dialog-type-${choice.id}`,
            type: "checkbox",
            checked: extracted.some((t) => t.name === choice.id),
            disabled: extracted.some((t) => t.name === choice.id && t.dubious === "true"),
          })
          .attr(
            "data-date",
            extracted.some((t) => t.name === choice.id)
              ? extracted.find((t) => t.name === choice.id)!.date
              : "",
          ),
      );
      div.append(
        $("<label>")
          .html(
            extracted.some((t) => t.name === choice.id)
              ? `${choice.name} ${extracted.find((t) => t.name === choice.id)!.dubious === "true" ? "(特殊なパラメーターが指定されているため WKSpinner で変更できません)":`(${extracted.find((t) => t.name === choice.id)!.date}) ${Object.entries(
                  extracted.find((t) => t.name === choice.id)!,
                )
                  .filter((e) => e[0] !== "name" && e[0] !== "date")
                  .map((e) => `(${e[0]}: ${e[1]})`)
                  .join(", ")}`}`
              : choice.name,
          )
          .prop("for", `wks-mi-dialog-type-${choice.id}`),
      );
      if (choice.params.length) {
        const params = $("<div>").addClass("wks-inline");
        for (const param of choice.params) {
          params.append(
            $("<label>")
              .html(
                `${param.name}${param.required ? ' <span class="wks-red">*</span>' : ""}: `,
              )
              .prop("for", `wks-mi-dialog-type-params-${param.id}`)
              .addClass("wks-shrink-0"),
          );
          let input;
          switch (param.type) {
            case "select":
              input = $("<select>");
              // eslint-disable-next-line no-case-declarations
              const options: Map<string, string> = new Map();
              for (const choice of param.choices) {
                input.append(
                  $("<option>").prop({ value: choice.id, text: choice.name }),
                );
                options.set(choice.name, choice.id);
              }
              if (extracted.some((t) => t.name === choice.id)) {
                input.val(
                  options.get(extracted.find((t) => t.name === choice.id)![param.name]!)!
                );
              }
              break;
            case "input":
              input = $("<input>").prop({
                type: "text",
                value: extracted.some((t) => t.name === choice.id)
                  ? extracted.find((t) => t.name === choice.id)![param.name]
                  : "",
              });
              break;
          }
          params.append(
            input.prop({
              id: `wks-mi-dialog-type-params-${param.id}`,
              required: param.required,
              style: "width: 100%;",
            }),
          );
        }
        div.append(params);
      }
      dialogTypeRow.append(div);
    }
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

    const getFinalContent = () => {
      const date = `${new Date().getFullYear()}年${new Date().getMonth() + 1}月`;
      const count = MI_CHOICES.filter((choice) =>
        $(`#wks-mi-dialog-type-${choice.id}:not(:disabled)`).prop("checked"),
      ).length;

      if (count >= 2) {
        return replaceFirstAndRemoveOtherIssueTemplates(pageContent).replace(
          ISSUE_TEMPLATE_AREA,
          `{{複数の問題\n${MI_CHOICES.map((choice) => {
            const checked = $(`#wks-mi-dialog-type-${choice.id}`).prop(
              "checked",
            );
            const isOriginal = extracted.some((t) => t.name === choice.id);
            const originalDate = $(`#wks-mi-dialog-type-${choice.id}`).attr(
              "data-date",
            )!;
            if (checked) {
              const params = MI_CHOICES.find((c) => c.id === choice.id)!.params;
              return `|${choice.name}=${isOriginal ? originalDate : date}${
                params.length
                  ? `${params
                      .map((param) => {
                        const val = $(
                          `#wks-mi-dialog-type-params-${param.id}`,
                        ).val();
                        if (param.type === "select" && val === "null") {
                          return "";
                        }
                        return `|${param.name}=${param.type === "select" ? param.choices.find((c) => c.id === val)!.name : val}`;
                      })
                      .join("|")}`
                  : ""
              }${extracted.some(x => "ソートキー" in x && MI_CHOICES.find(y => y.id === x.name)?.name === choice.name) ? `|ソートキー=${extracted.find(x => x["ソートキー"]! && MI_CHOICES.find(y => y.id === x.name)?.name === choice.name)!["ソートキー"]}`:""}\n`;
            } else {
              return "";
            }
          }).join("")}}}\n`,
        );
      } else {
        const choice = MI_CHOICES.find((choice) =>
          $(`#wks-mi-dialog-type-${choice.id}:not(:disabled)`).prop("checked"),
        );
        if (!choice) {
          return replaceFirstAndRemoveOtherIssueTemplates(pageContent).replace(
            ISSUE_TEMPLATE_AREA,
            "",
          );
        }
        const params = choice.params;
        const isOriginal = extracted.some((t) => t.name === choice.id);
        const originalDate = $(`#wks-mi-dialog-type-${choice.id}`).attr(
          "data-date",
        )!;
        return replaceFirstAndRemoveOtherIssueTemplates(pageContent).replace(
          ISSUE_TEMPLATE_AREA,
          `{{${choice.name}|date=${isOriginal ? originalDate : date}${
            params.length
              ? `|${params
                  .map((param) => {
                    const val = $(
                      `#wks-mi-dialog-type-params-${param.id}`,
                    ).val();
                    if (param.type === "select" && val === "null") {
                      return "";
                    }
                    return `${(param as { oneName: string | null }).oneName === null ? "" : `${param.name}=`}${param.type === "select" ? param.choices.find((c) => c.id === val)!.name : val}`;
                  })
                  .join("|")}`
              : ""
          }${extracted.some(x => "ソートキー" in x && MI_CHOICES.find(y => y.id === x.name)?.name === choice.name) ? `|ソートキー=${extracted.find(x => x["ソートキー"]! && MI_CHOICES.find(y => y.id === x.name)?.name === choice.name)!["ソートキー"]}`:""}}}\n`,
        );
      }
    };

    const getFinalSummary = () => {
      const count = MI_CHOICES.filter((choice) =>
        $(`#wks-mi-dialog-type-${choice.id}`).prop("checked"),
      ).length;
      const tlName =
        count >= 2
          ? "複数の問題"
          : count == 0
            ? "問題テンプレートを除去"
            : MI_CHOICES.find((choice) =>
                $(`#wks-mi-dialog-type-${choice.id}`).prop("checked"),
              )!.name;
      return (
        (($("#wks-mi-dialog-summary-input").val() as string).replaceAll(
          "$t",
          tlName,
        ) || `+${tlName}`) + SUMMARY_AD
      );
    };

    const checkParams = () => {
      const errList = $("<ul>");

      for (const choice of MI_CHOICES) {
        if ($(`#wks-mi-dialog-type-${choice.id}`).prop("checked")) {
          const params = choice.params;
          for (const param of params) {
            if (param.required) {
              const val = $(`#wks-mi-dialog-type-params-${param.id}`).val();
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
