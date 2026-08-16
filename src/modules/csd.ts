import {
  ERRORS,
  NAMESPACE_MAP,
  SCRIPT_NAME,
  SD_REASON,
  SUMMARY_AD,
  SUMMARY_AD_ATTRACT,
} from "@/constants";
import { openDialog } from "@/dialog";
import {
  createRowFunc,
  getPageEditContext,
  getImage,
  getOptionProperty,
  takePortlet,
} from "@/util";

export async function initCsd() {
  const namespaceNumber = mw.config.get("wgNamespaceNumber");
  const namespaceName = NAMESPACE_MAP.get(namespaceNumber);

  const csdPortlet = takePortlet("wks-csd");
  if (!csdPortlet) {
    console.warn(`${SCRIPT_NAME}: メニューの作成に失敗しました。`);
    return;
  }

  csdPortlet.addEventListener("click", async (e) => {
    e.preventDefault();

    const pageContextPromise = getPageEditContext(
      mw.config.get("wgPageName"),
      true,
    );
    const createRow = createRowFunc("csd");
    const dialogContent = $("<div>")
      .prop("id", "wks-csd-dialog-content")
      .text("読み込み中")
      .append(getImage("load", "margin-left: 0.5em;"));
    const csdDialog = await openDialog({
      title: `${SCRIPT_NAME} - 即時削除`,
      dialogClass: "wks-csd-dialog",
      content: dialogContent,
    });
    const pageContext = await pageContextPromise;
    if (pageContext.revisionId === null || pageContext.content === null) {
      dialogContent.empty().text("ページが存在しないため編集できません。");
      csdDialog.setButtons([
        { label: "閉じる", onClick: () => csdDialog.close() },
      ]);
      return;
    }
    const pageContent = pageContext.content;
    dialogContent.empty();
    const dialogFieldset = $("<fieldset>");
    dialogFieldset.prop({
      id: "wks-csd-dialog-optionfield",
      innerHTML: "<legend>即時削除テンプレートの貼付</legend>",
    });
    dialogContent.append(dialogFieldset);
    const dialogTypeRow = createRow("type");
    const dialogTypeSelect = $("<select>");
    dialogTypeSelect.prop("id", "wks-csd-dialog-type-select");
    dialogTypeSelect.addClass("wks-input-full");

    const generalCsdReasons = SD_REASON.filter(
      (reason) => reason.type === "全般",
    );

    for (const reason of generalCsdReasons) {
      dialogTypeSelect.append(
        $("<option>").prop({
          value: reason.name,
          text: `${reason.name}: ${reason.shortDesc}`,
        }),
      );
    }

    const namespaceCsdReasons = SD_REASON.filter(
      (reason) => reason.type === namespaceName,
    );
    if (namespaceCsdReasons.length > 0) {
      for (const reason of namespaceCsdReasons) {
        dialogTypeSelect.append(
          $("<option>").prop({
            value: reason.name,
            text: `${reason.name}: ${reason.shortDesc}`,
          }),
        );
      }
    }

    const isRedirect = mw.config.get("wgIsRedirect");

    if (isRedirect) {
      const redirectCsdReasons = SD_REASON.filter(
        (reason) => reason.type === "リダイレクト",
      );
      for (const reason of redirectCsdReasons) {
        dialogTypeSelect.append(
          $("<option>").prop({
            value: reason.name,
            text: `${reason.name}: ${reason.shortDesc}`,
          }),
        );
      }
    }

    const dialogTypeParams = createRow("params");
    const dialogBlank = createRow("blank");
    const dialogBlankInput = $("<input>").prop({
      id: "wks-csd-dialog-blank-checkbox",
      type: "checkbox",
    });
    dialogBlank.append(dialogBlankInput);
    dialogBlank.append(
      $("<label>")
        .html("ページを即時削除で置き換える(元ページの内容を削除する)")
        .prop("for", "wks-csd-dialog-blank-checkbox"),
    );

    const handleSelect = () => {
      const selected = dialogTypeSelect.val();
      const selectedReason = SD_REASON.find(
        (reason) => reason.name === selected,
      );
      dialogTypeParams.empty();
      if (!selectedReason) {
        return;
      }
      for (const param of selectedReason.params) {
        dialogTypeParams.append(
          $("<label>")
            .html(
              `${param.name}${param.required ? ' <span class="wks-red">*</span>' : ""}`,
            )
            .prop("for", `wks-csd-dialog-type-params-${param.id}`),
        );
        if (param.type === "input") {
          dialogTypeParams.append(
            $("<input>").prop({
              id: `wks-csd-dialog-type-params-${param.id}`,
              type: "text",
              placeholder: param.placeholder,
              required: param.required,
              class: "wks-input-full",
            }),
          );
        } else if (param.type === "select") {
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
        }
      }

      if (selectedReason.blank) {
        dialogBlankInput.prop("checked", true);
      } else {
        dialogBlankInput.prop("checked", false);
      }
    };

    handleSelect();

    dialogTypeSelect.on("change", handleSelect);

    const dialogComment = createRow("comment");
    dialogComment.append(
      $("<label>").html("コメント").prop("for", "wks-csd-dialog-comment"),
    );
    const dialogCommentInput = $("<input>").prop({
      id: "wks-csd-dialog-comment",
      type: "text",
      placeholder: "コメント",
      class: "wks-input-full",
    });
    dialogComment.append(dialogCommentInput);

    const dialogSummary = createRow("summary");
    dialogSummary.append(
      $("<label>")
        .html(
          `編集の要約 (指定しない場合 "+sd") "${SUMMARY_AD_ATTRACT}" が自動付加されます`,
        )
        .prop("for", "wks-csd-dialog-summary-input"),
    );
    dialogSummary.append(
      $("<input>").prop({
        id: "wks-csd-dialog-summary-input",
        type: "text",
        placeholder: "+sd",
        class: "wks-input-full",
        value: getOptionProperty("csd.default.summary"),
      }),
    );

    dialogTypeRow.append(dialogTypeSelect);
    dialogFieldset.append(dialogTypeRow);
    dialogFieldset.append(dialogTypeParams);
    dialogFieldset.append(dialogComment);
    dialogFieldset.append(dialogBlank);
    dialogFieldset.append(dialogSummary);

    const getFinalContent = () => {
      return (
        `${
          namespaceNumber === 10
            ? "<noinclude>"
            : mw.config.get("wgPageName").endsWith(".css") ||
                mw.config.get("wgPageName").endsWith(".js")
              ? "/* "
              : ""
        }{{即時削除|${dialogTypeSelect.val()}${dialogTypeParams
          .children()
          .toArray()
          .filter(
            (param) => param.tagName === "INPUT" || param.tagName === "SELECT",
          )
          .map((param) => {
            const input = $(param).first();
            let fi = input.val();
            if (dialogTypeSelect.val() === "全般10") {
              switch (fi) {
                case "ellsiemall":
                  fi = "[[LTA:ELLS]]";
                  break;
                case "heathrow":
                  fi = "[[LTA:HEATHROW]]";
                  break;
                case "hightechodap":
                  fi = "[[LTA:HGTCHDP]]";
                  break;
                case "nttpc":
                  fi = "[[LTA:NTTPC]]";
                  break;
                case "suzu":
                  fi = "[[LTA:SUZU]]";
                  break;
                case "raya":
                  fi = "[[LTA:RAYA]]";
                  break;
                case "als":
                  fi = "[[LTA:ALS]]";
                  break;
                case "sorry":
                  fi = "[[LTA:SORRY]]";
                  break;
                case "san":
                  fi = "[[LTA:SAN]]";
                  break;
                case "nmt":
                  fi = "[[LTA:NMT]]";
                  break;
                case "castub":
                  fi = "[[LTA:CASTUB]]";
                  break;
                case "kamedy":
                  fi = "[[LTA:KAMEDY]]";
                  break;
                case "internet-libertarian":
                  fi = "[[WP:VIP#Internet_Libertarian]]";
                  break;
                default:
                  break;
              }
            }
            return `|${input.prop("id").replace("wks-csd-dialog-type-params-", "")}=${fi}`;
          })
          .join(
            "",
          )}${dialogCommentInput.val() ? `|コメント=${dialogCommentInput.val()}` : ""}}}${
          namespaceNumber === 10
            ? "</noinclude>"
            : mw.config.get("wgPageName").endsWith(".css") ||
                mw.config.get("wgPageName").endsWith(".js")
              ? " */\n"
              : "\n"
        }` + (dialogBlankInput.prop("checked") ? "" : pageContent)
      );
    };

    const getFinalSummary = () => {
      return ($("#wks-csd-dialog-summary-input").val() || "+sd") + SUMMARY_AD;
    };

    const checkParams = () => {
      const errList = $("<ul>");
      const selected = dialogTypeSelect.val();
      const selectedReason = SD_REASON.find(
        (reason) => reason.name === selected,
      );
      if (!selectedReason) {
        errList.append($("<li>").text("理由が選択されていません"));
        return errList;
      }
      const params = selectedReason.params;
      for (const param of params) {
        const input = $(`#wks-csd-dialog-type-params-${param.id}`);
        if (param.type === "input" && param.required && !input.val()) {
          errList.append($("<li>").text(`${param.name}が入力されていません`));
        }
        if (
          param.type === "select" &&
          param.required &&
          (!input.val() || input.val() === "null")
        ) {
          errList.append($("<li>").text(`${param.name}が選択されていません`));
        }
      }
      if (errList.children().length) {
        return $("<div>")
          .append($("<p>").text("入力にエラーがあります。"))
          .append(errList);
      } else {
        return null;
      }
    };

    const preview = async () => {
      const errList = checkParams();
      if (errList) {
        mw.notify(errList, {
          type: "error",
        });
        return;
      }
      const previewContentHolder = $("<div>").css({
        maxHeight: "70vh",
        maxWidth: "80vw",
      });
      const previewDialog = await openDialog({
        title: `${SCRIPT_NAME} - 即時削除プレビュー`,
        dialogClass: "wks-csd-dialog wks-csd-dialog-preview",
        content: previewContentHolder,
      });
      const previewContent = $("<div>")
        .prop("id", "wks-dialog-preview-content")
        .text("読み込み中")
        .append(getImage("load", "margin-left: 0.5em;"));
      previewContentHolder.append(previewContent);
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
        //contentmodel: "wikitext",
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
        .prop("id", "wks-csd-dialog-preview-summary");
      const hr = $("<hr>").addClass("wks-hr");
      const previewDiv = $("<div>")
        .html(parseRes.parse.text)
        .prop("id", "wks-csd-dialog-preview-div")
        .addClass("wks-dialog-preview-div");
      previewContent.append(summaryPreview);
      previewContent.append(hr);
      previewContent.append(previewDiv);
      previewDialog.reposition();
    };

    const execute = async () => {
      const errList = checkParams();
      if (errList) {
        mw.notify(errList, {
          type: "error",
        });
        return;
      }
      try {
        const editRes = await new mw.Api().postWithEditToken({
          action: "edit",
          title: mw.config.get("wgPageName"),
          nocreate: 1,
          text: getFinalContent(),
          summary: getFinalSummary(),
          formatversion: "2",
          baserevid: pageContext.revisionId,
          starttimestamp: pageContext.startTimestamp,
        });
        if (editRes.edit.result === "Success") {
          mw.notify("ページの編集に成功しました。");
          csdDialog.close();
          window.location.reload();
        } else {
          mw.notify(
            // @ts-expect-error index get
            "エラー: " + ERRORS[editRes.error?.code] ||
              editRes.error?.info ||
              e,
          );
        }
      } catch (e) {
        // @ts-expect-error index get
        mw.notify("エラー: " + ERRORS[e] || e);
      }
    };

    csdDialog.setButtons([
      {
        label: "実行",
        variant: "progressive",
        onClick: () => execute(),
      },
      {
        label: "プレビュー",
        onClick: () => preview(),
      },
      {
        label: "閉じる",
        onClick: () => csdDialog.close(),
      },
    ]);

    csdDialog.reposition();
  });
}
