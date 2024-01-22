import {
  MI_CHOICES,
  SCRIPT_NAME,
  SUMMARY_AD,
  SUMMARY_AD_ATTRACT,
  ERRORS,
} from "@/constants";
import {
  createPortletLink,
  createRowFunc,
  getImage,
  getOptionProperty,
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
    dialogContent.empty();
    const dialogFieldset = $("<fieldset>");
    dialogFieldset.prop({
      id: "wks-mi-dialog-optionfield",
      innerHTML: "<legend>問題テンプレートの貼付</legend>",
    });
    dialogContent.append(dialogFieldset);
    const dialogTypeRow = createRow("type");
    for (const choice of MI_CHOICES) {
      const div = $("<div>").addClass("wks-inline");
      div.append(
        $("<input>").prop({
          id: `wks-mi-dialog-type-${choice.id}`,
          type: "checkbox",
        }),
      );
      div.append(
        $("<label>")
          .html(choice.name)
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
              for (const choice of param.choices) {
                input.append(
                  $("<option>").prop({ value: choice.id, text: choice.name }),
                );
              }
              break;
            case "input":
              input = $("<input>").prop({ type: "text" });
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
        $(`#wks-mi-dialog-type-${choice.id}`).prop("checked"),
      ).length;

      if (count >= 2) {
        return (
          `{{複数の問題\n${MI_CHOICES.map((choice) => {
            const checked = $(`#wks-mi-dialog-type-${choice.id}`).prop(
              "checked",
            );
            if (checked) {
              const params = MI_CHOICES.find((c) => c.id === choice.id)!.params;
              return `|${choice.name}=${date}${
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
              }\n`;
            } else {
              return "";
            }
          }).join("")}}}\n` + pageContent
        );
      } else {
        const choice = MI_CHOICES.find((choice) =>
          $(`#wks-mi-dialog-type-${choice.id}`).prop("checked"),
        );
        if (!choice) {
          return `{{Error|何も選択されていません。}}`;
        }
        const params = choice.params;
        return (
          `{{${choice.name}|date=${date}${
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
          }}}\n` + pageContent
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

    const preview = async () => {
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
        contentmodel: "wikitext",
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
