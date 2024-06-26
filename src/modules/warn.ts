import {
  ERRORS,
  SCRIPT_NAME,
  SUMMARY_AD,
  SUMMARY_AD_ATTRACT,
  WARN_TEMPLATES,
} from "@/constants";
import {
  createPortletLink,
  createRowFunc,
  getImage,
  getOptionProperty,
} from "@/util";

export async function initWarn() {
  const namespaceNumber = mw.config.get("wgNamespaceNumber");
  //const revisionId = mw.config.get("wgRevisionId");

  const warnPortlet = createPortletLink(
    "通知",
    "wks-warn",
    "ユーザーへ通知・警告を行う",
  );
  if (!warnPortlet) {
    console.warn(`${SCRIPT_NAME}: メニューの作成に失敗しました。`);
    return;
  }

  const talkPageName = namespaceNumber === 3 ? mw.config.get("wgPageName") : `${mw.config.get("wgFormattedNamespaces")[3]}:${mw.config.get("wgTitle")}`;

  warnPortlet.addEventListener("click", async (e) => {
    e.preventDefault();

    if (talkPageName.includes("/")) {
      mw.notify(`${SCRIPT_NAME}: 警告: ノートページのサブページに警告を行おうとしています！`, { type: "warn" });
    }
  
    const createRow = createRowFunc("warn");
    const warnDialog = $("<div>");
    warnDialog.css("max-height", "70vh").dialog({
      dialogClass: "wks-warn-dialog",
      title: `${SCRIPT_NAME} - ユーザーへ通知・警告`,
      resizable: false,
      height: "auto",
      width: "auto",
      modal: true,
      close: function () {
        $(this).empty().dialog("destroy");
      },
    });
    const dialogContent = $("<div>")
      .prop("id", "wks-warn-dialog-content")
      .text("読み込み中")
      .append(getImage("load", "margin-left: 0.5em;"));
    warnDialog.append(dialogContent);
    dialogContent.empty();
    const dialogFieldset = $("<fieldset>");
    dialogFieldset.prop({
      id: "wks-warn-dialog-optionfield",
      innerHTML: "<legend>通知・警告テンプレートの貼付</legend>",
    });
    dialogContent.append(dialogFieldset);
    const dialogTypeRow = createRow("type");
    const dialogTypeSelect = $("<select>");
    dialogTypeSelect.prop("id", "wks-warn-dialog-type-select");
    dialogTypeSelect.addClass("wks-input-full");

    for (const template of WARN_TEMPLATES) {
      // optgroup があったらそこに追加し、なかったら作成
      const optGroup = dialogTypeSelect.find(`optgroup[label="${template.category}"]`);
      if (optGroup.length) {
        optGroup.append(
          $("<option>").prop({
            value: template.name,
            text: `${template.name}: ${template.description}`,
          }),
        );
      } else {
        dialogTypeSelect.append(
          $("<optgroup>").prop("label", template.category).append(
            $("<option>").prop({
              value: template.name,
              text: `${template.name}: ${template.description}`,
            }),
          ),
        );
      }
    }

    const dialogTypeParams = createRow("params");
    const dialogSectionTitleParams = createRow("sectiontitle");

    const handleSelect = () => {
      const selected = dialogTypeSelect.val();
      const selectedTemplate = WARN_TEMPLATES.find(
        (template) => template.name === selected,
      );
      dialogTypeParams.empty();
      if (!selectedTemplate) {
        return;
      }
      for (const param of selectedTemplate.params) {
        dialogTypeParams.append(
          $("<label>")
            .html(
              `${param.name}${param.required ? ' <span class="wks-red">*</span>' : ""}`,
            )
            .prop("for", `wks-warn-dialog-type-params-${param.id}`),
        );
        if (param.type === "input") {
          dialogTypeParams.append(
            $("<input>").prop({
              id: `wks-warn-dialog-type-params-${param.id}`,
              type: "text",
              placeholder: param.placeholder,
              required: param.required,
              class: "wks-input-full",
              value: ("defaultValue" in param ? param.defaultValue : "")
            }),
          );
        }/* else if (param.type === "select") {
          const select = $("<select>").prop({
            id: `wks-csd-dialog-type-params-${param.id}`,
            required: param.required,
          });
          for (const option of param.choices) {
            select.append(
              $("<option>").prop({
                value: option.id,
                text: option.name,
              }),
            );
          }
          dialogTypeParams.append(select);
        }*/
      }

      dialogSectionTitleParams.empty();
      if (!selectedTemplate.hasTitle) {
        dialogSectionTitleParams.append(
          $("<label>").html("セクションタイトル").prop("for", "wks-warn-dialog-sectiontitle-input"),
        );
        dialogSectionTitleParams.append(
          $("<input>").prop({
            id: "wks-warn-dialog-sectiontitle-input",
            type: "text",
            placeholder: "セクションタイトル",
            class: "wks-input-full",
            value: selectedTemplate.defaultTitle,
          }),
        );
      }
    };

    handleSelect();
    dialogTypeSelect.on("change", handleSelect);

    const dialogComment = createRow("comment");
    dialogComment.append(
      $("<label>").html("追加コメント").prop("for", "wks-warn-dialog-comment"),
    );
    const dialogCommentInput = $("<textarea>").prop({
      id: "wks-warn-dialog-comment",
      placeholder: "コメント",
      class: "wks-input-full",
      rows: 3,
    });
    
    dialogComment.append(dialogCommentInput);

    const dialogSummary = createRow("summary");
    dialogSummary.append(
      $("<label>")
        .html(
          `編集の要約 (指定しない場合 "+{{$t}}") ($tにはテンプレート名) "${SUMMARY_AD_ATTRACT}" が自動付加されます`,
        )
        .prop("for", "wks-warn-dialog-summary-input"),
    );
    dialogSummary.append(
      $("<input>").prop({
        id: "wks-warn-dialog-summary-input",
        type: "text",
        placeholder: "$t",
        class: "wks-input-full",
        value: getOptionProperty("warn.default.summary") || "$t",
      }),
    );

    const subscribeRow = createRow("subscribe");
    const subscribeCheckbox = $("<input>").prop({
      id: "wks-warn-dialog-subscribe-checkbox",
      type: "checkbox",
      checked: true
    });
    subscribeRow.append(subscribeCheckbox);
    subscribeRow.append(
      $("<label>")
        .html("このセクションを購読する")
        .prop("for", "wks-warn-dialog-subscribe-checkbox"),
    );

    dialogTypeRow.append(dialogTypeSelect);
    dialogFieldset.append(dialogTypeRow);
    dialogFieldset.append(dialogSectionTitleParams);
    dialogFieldset.append(dialogTypeParams);
    dialogFieldset.append(dialogComment);
    dialogFieldset.append(dialogSummary);
    dialogFieldset.append(subscribeRow);

    const getFinalContent = () => {
      const tl = WARN_TEMPLATES.find(
        (template) => template.name === dialogTypeSelect.val(),
      )!;
      return (
        `{{${"nosubst" in tl && tl.nosubst ? "":"subst:"}` +
        dialogTypeSelect.val() +
        tl.params
          .map((param) => {
            const input = $(`#wks-warn-dialog-type-params-${param.id}`);
            return input.val() ? `|${param.id}=${input.val()}` : "";
          })
          .join("") + 
        "}}\n" + dialogCommentInput.val()// + "--~~~~"
      );
    };

    const getFinalSummary = () => {
      return ($("#wks-warn-dialog-summary-input").val() || "$t").toString().replace(
        "$t",
        dialogTypeSelect.val()?.toString() || "",
      ) + SUMMARY_AD;
    };

    const checkParams = () => {
      const errList = $("<ul>");
      const selected = dialogTypeSelect.val();
      const selectedTemplate = WARN_TEMPLATES.find(
        (template) => template.name === selected,
      );
      if (!selectedTemplate) {
        errList.append($("<li>").text("テンプレートが選択されていません"));
        return errList;
      }
      const params = selectedTemplate.params;
      for (const param of params) {
        const input = $(`#wks-warn-dialog-type-params-${param.id}`);
        if (param.type === "input" && param.required && !input.val()) {
          errList.append($("<li>").text(`${param.name}が入力されていません`));
        }
        /*if (param.type === "select" && param.required && (!input.val() || input.val() === "null")) {
          errList.append($("<li>").text(`${param.name}が選択されていません`));
        }*/
      }
      if (errList.children().length) {
        return $("<div>").append($("<p>").text("入力にエラーがあります。")).append(errList);
      } else {
        return null;
      }
    }

    const preview = async () => {
      const errList = checkParams();
      if (errList) {
        mw.notify(errList, {
          type: "error",
        });
        return;
      }

      const selected = dialogTypeSelect.val();
      const selectedTemplate = WARN_TEMPLATES.find(
        (template) => template.name === selected,
      );

      const previewDialog = $("<div>")
        .css({
          maxHeight: "70vh",
          maxWidth: "80vw",
        })
        .dialog({
          dialogClass: "wks-warn-dialog wks-warn-dialog-preview",
          title: `${SCRIPT_NAME} - 通知プレビュー`,
          height: "auto",
          width: "auto",
          modal: true,
          close: function () {
            $(this).empty().dialog("destroy");
          },
        });
      const previewContent = $("<div>")
        .prop("id", "wks-dialog-preview-content")
        .text("読み込み中")
        .append(getImage("load", "margin-left: 0.5em;"));
      previewDialog.append(previewContent);
      const parseRes = (await new mw.Api().post({
        action: "discussiontoolspreview",
        page: talkPageName,
        type: "topic",
        sectiontitle: selectedTemplate?.hasTitle ? "":$("#wks-warn-dialog-sectiontitle-input").val(),
        wikitext: getFinalContent(),
        uselang: "ja",
        useskin: mw.config.get("skin"),
        //summary: getFinalSummary(),
        //prop: "text|modules|jsconfigvars",
        //pst: true,
        //disablelimitreport: true,
        //disableeditsection: true,
        //disabletoc: true,
        //contentmodel: "wikitext",
        formatversion: "2",
      })).discussiontoolspreview;
      previewContent.empty();
      if (parseRes.parse.modules.length) {
        mw.loader.load(parseRes.parse.modules);
      }
      if (parseRes.parse.modulestyles.length) {
        mw.loader.load(parseRes.parse.modulestyles);
      }
      /*const summaryPreview = $("<div>")
        .html(parseRes.parse.parsedsummary)
        .prop("id", "wks-warn-dialog-preview-summary");
      const hr = $("<hr>").addClass("wks-hr");*/
      const previewDiv = $("<div>")
        .html(parseRes.parse.text)
        .prop("id", "wks-warn-dialog-preview-div")
        .addClass("wks-dialog-preview-div");
      //previewContent.append(summaryPreview);
      //previewContent.append(hr);
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
      const errList = checkParams();
      if (errList) {
        mw.notify(errList, {
          type: "error",
        });
        return;
      }

      const selected = dialogTypeSelect.val();
      const selectedTemplate = WARN_TEMPLATES.find(
        (template) => template.name === selected,
      );

      try {
        const editRes = await new mw.Api().postWithEditToken({
          action: "discussiontoolsedit",
          page: talkPageName,
          uselang: "ja",
          useskin: mw.config.get("skin"),
          wikitext: getFinalContent(),
          summary: getFinalSummary(),
          formatversion: "2",
          paction: "addtopic",
          dtenable: 1,
          dttags: "discussiontools,discussiontools-source,discussiontools-source-enhanced,discussiontools-newtopic",
          sectiontitle: selectedTemplate?.hasTitle ? "":$("#wks-warn-dialog-sectiontitle-input").val(),
          allownosectiontitle: true,
          autosubscribe: $("#wks-warn-dialog-subscribe-checkbox").prop("checked") ? "yes":"no",
        });
        if ((editRes.discussiontoolsedit?.result || editRes.edit?.result)?.toLowerCase() === "success") {
          mw.notify("ページの編集に成功しました。");
          warnDialog.dialog("close");
          window.location.href = mw.util.getUrl(talkPageName);
        } else {
          mw.notify(
            // @ts-expect-error index get
            "エラー: " + ERRORS[editRes.error?.code] ||
              editRes.error?.info ||
              editRes.toString()
          );
        }
      } catch (e) {
        // @ts-expect-error index get
        mw.notify("エラー: " + ERRORS[e] || (e ?? "Unknown error").toString());
      }
    };

    warnDialog.dialog({
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
            return warnDialog.dialog("close");
          },
        },
      ],
    });

    warnDialog.dialog({
      position: {
        my: "top",
        at: "top+5%",
        of: window,
      },
    });
  });
}
