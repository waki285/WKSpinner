import { SRD_REASON, SUMMARY_AD, SUMMARY_AD_ATTRACT } from "@/constants";
import { createRowFunc, formatDate, getImage, getOptionProperty, sleep } from "@/util";

function formatDateRanges(data: [string, number][]) {
  data.sort((a, b) => a[1] - b[1]);

  const regex = new RegExp(
    getOptionProperty("historyTimeFormat").split("|")[0],
  );

  data = data.map((d) => {
    const [_match, q, z, e, _r, t, b] = d[0].match(regex)!;

    const splitFlag = getOptionProperty("historyTimeFormat").split("|")[1];

    let y, m, day, h, min;

    for (let i = 0; i < splitFlag.length; i++) {
      switch (splitFlag[i]) {
        case "Y":
          y = q;
          break;
        case "M":
          m = z;
          break;
        case "D":
          day = e;
          break;
        case "W":
          break;
        case "H":
          h = t;
          break;
        case "m":
          min = b;
          break;
      }
    }

    const dateString = formatDate(parseInt(y!, 10), parseInt(m!, 10), parseInt(day!, 10), parseInt(h!, 10), parseInt(min!, 10), getOptionProperty("timezone") || "UTC");

    return [dateString, d[1]];
  });

  let output = "";
  let start = data[0]![0]!;
  let end = start;
  let prevIndex = data[0]![1]!;

  for (let i = 1; i < data.length; i++) {
    const currentDate = data[i]![0]!;
    const currentIndex = data[i]![1]!;

    if (currentIndex - prevIndex > 1) {
      output += start === end ? start : start + "〜" + end;
      output += "、";
      start = currentDate;
    }

    end = currentDate;
    prevIndex = currentIndex;
  }

  output += start === end ? start : start + "〜" + end;
  output += "の版";

  return output;
}

export async function initCsrd() {
  const namespaceNumber = mw.config.get("wgNamespaceNumber");

  let opened = false;

  const btn = $("<button>")
    .prop({
      id: "csrd-btn",
      class: "cdx-button",
      title: "WKSpinnerを使用し即時版指定削除申請を行う",
      type: "button",
    })
    .text("即時版指定削除 (WKSpinner)");
  $(".mw-history-compareselectedversions").first().append(btn);

  const curRev = mw.config.get("wgCurRevisionId");

  $("#csrd-btn").on("click", async (e) => {
    e.preventDefault();
    if (opened) {
      return;
    }
    opened = true;

    const box = $("<div>").prop({
      id: "csrd-box",
      class: "wks-box",
      style: "margin:16px auto;",
    });
    $(".mw-history-compareselectedversions").first().after(box);

    const dialogContent = $("<div>")
      .prop("id", "wks-csrd-dialog-content")
      .text("読み込み中")
      .append(getImage("load", "margin-left: 0.5em;"));
    $("#csrd-box").append(dialogContent);
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

    const createRow = createRowFunc("csrd");

    const dialogFieldset = $("<fieldset>");
    dialogFieldset.prop({
      id: "wks-csrd-dialog-optionfield",
      innerHTML: "<legend>即時版指定削除テンプレートの貼付</legend>",
      style: "margin:0;",
    });
    $("#csrd-box").append(dialogFieldset);
    await sleep(100);
    const dialogTypeRow = createRow("type");
    const dialogTypeSelect = $("<select>");
    dialogTypeSelect.prop({
      id: "wks-csrd-dialog-type-select",
      style: "font-size: 16px;",
    });

    for (const reason of SRD_REASON) {
      dialogTypeSelect.append(
        $("<option>").prop({
          value: reason.name,
          text: `${reason.name}: ${reason.shortDesc}`,
        }),
      );
    }

    const dialogTypeParams = createRow("params");

    const handleSelect = () => {
      const selected = dialogTypeSelect.val();
      const selectedReason = SRD_REASON.find(
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
            .prop("for", `wks-csrd-dialog-type-params-${param.id}`),
        );
        if (param.type === "input") {
          dialogTypeParams.append(
            $("<input>").prop({
              id: `wks-csrd-dialog-type-params-${param.id}`,
              type: "text",
              placeholder: param.placeholder,
              required: param.required,
              style: "width: 100%; font-size: 16px;",
            }),
          );
        } /* else if (param.type === "select") {
          const select = $("<select>").prop({
            id: `wks-csrd-dialog-type-params-${param.id}`,
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
    };

    handleSelect();

    dialogTypeSelect.on("change", handleSelect);

    const dialogAdditional = createRow("additional");
    dialogAdditional.append(
      $("<label>")
        .html("追加情報")
        .prop("for", "wks-csrd-dialog-additional"),
    );
    dialogAdditional.append(
      $("<input>").prop({
        id: "wks-csrd-dialog-additional",
        type: "text",
        placeholder: "20xx年x月x日 (x) xx:xx (UTC) の版は要約欄を含む",
        style: "width: 100%; font-size: 16px;",
      }),
    );

    const dialogComment = createRow("comment");
    dialogComment.append(
      $("<label>").html("コメント").prop("for", "wks-csrd-dialog-comment"),
    );
    const dialogCommentInput = $("<input>").prop({
      id: "wks-csrd-dialog-comment",
      type: "text",
      placeholder: "コメント",
      style: "width: 100%; font-size: 16px;",
    });
    dialogComment.append(dialogCommentInput);

    const dialogSummary = createRow("summary");
    dialogSummary.append(
      $("<label>")
        .html(
          `編集の要約 (指定しない場合 "+srd") "${SUMMARY_AD_ATTRACT}" が自動付加されます`,
        )
        .prop("for", "wks-csrd-dialog-summary-input"),
    );
    dialogSummary.append(
      $("<input>").prop({
        id: "wks-csrd-dialog-summary-input",
        type: "text",
        placeholder: "+srd",
        style: "width: 100%; font-size: 16px;",
        value: getOptionProperty("csrd.default.summary"),
      }),
    );

    dialogTypeRow.append(dialogTypeSelect);
    dialogFieldset.append(dialogTypeRow);
    dialogFieldset.append(dialogTypeParams);
    dialogFieldset.append(dialogAdditional);
    dialogFieldset.append(dialogComment);
    dialogFieldset.append(dialogSummary);
    dialogFieldset.append($("<p>").text(getOptionProperty("timezone") !== "UTC" ? "注意: あなたはWKSpinnerの設定でタイムゾーンをUTC以外に設定しているため、タイムゾーンが自動で補正されます。":""))

    const revisions: [string, number][] = [];
    const functions: ((e: Event) => void)[] = [];

    document.querySelectorAll(".mw-changeslist-date").forEach((el, i) => {
      const func = (e: Event) => {
        e.preventDefault();
        if (el.classList.contains("wks-revision-selected")) {
          revisions.splice(
            revisions.findIndex((rev) => rev[1] === i),
            1,
          );
          el.classList.remove("wks-revision-selected");
        } else {
          revisions.push([el.textContent!, i]);
          el.classList.add("wks-revision-selected");
        }
        console.log(revisions);
      };
      el.addEventListener("click", func);
      functions.push(func);
    });

    const getFinalContent = () => {
      return (
        `${
          namespaceNumber === 10
            ? "<noinclude>"
            : mw.config.get("wgPageName").endsWith(".css") ||
                mw.config.get("wgPageName").endsWith(".js")
              ? "/* "
              : ""
        }{{即時版指定削除|${dialogTypeSelect.val()}|${formatDateRanges(revisions)}${$("#wks-csrd-dialog-additional").val() ? ` ${$("#wks-csrd-dialog-additional").val()}`:""}${dialogTypeParams
          .children()
          .toArray()
          .filter(
            (param) => param.tagName === "INPUT" || param.tagName === "SELECT",
          )
          .map((param) => {
            const input = $(param).first();
            const fi = input.val();
            return `|${input.prop("id").replace("wks-csrd-dialog-type-params-", "")}=${fi}`;
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
        }` + pageContent
      );
    };
    const getFinalSummary = () => {
      return ($("#wks-csrd-dialog-summary-input").val() || "+sd") + SUMMARY_AD;
    };

    const dialogButton = $("<button>")
      .prop({
        id: "wks-csrd-dialog-button",
        class: "cdx-button",
        type: "button",
      })
      .text("即時版指定削除を行う");

    $("#csrd-box").append(dialogButton);

    const previewButton = $("<button>")
      .prop({
        id: "wks-csrd-dialog-preview-button",
        class: "cdx-button",
        type: "button",
      })
      .text("プレビュー");
    $("#csrd-box").append(previewButton);

    const cancelButton = $("<button>")
      .prop({
        id: "wks-csrd-dialog-cancel-button",
        class: "cdx-button",
        type: "button",
      })
      .text("キャンセル");
    $("#csrd-box").append(cancelButton);

    const checkParams = () => {
      const errList = $("<ul>");
      const selected = dialogTypeSelect.val();
      const selectedReason = SRD_REASON.find(
        (reason) => reason.name === selected,
      );
      if (!selectedReason) {
        errList.append($("<li>").text("理由が選択されていません"));
        return errList;
      }
      for (const param of selectedReason.params) {
        if (param.required) {
          const input = $(`#wks-csrd-dialog-type-params-${param.id}`);
          if (!input.val()) {
            errList.append($("<li>").text(`${param.name}が入力されていません`));
          }
        }
      }
      if (revisions.length === 0) {
        errList.append($("<li>").text("版が選択されていません"));
      }
      if (errList.children().length) {
        return $("<div>")
          .append($("<p>").text("入力にエラーがあります。"))
          .append(errList);
      } else {
        return null;
      }
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
          baserevid: curRev,
        });
        if (editRes.edit.result === "Success") {
          mw.notify("ページの編集に成功しました。");
          $("#csrd-box").empty();
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

    const preview = async () => {
      const err = checkParams();
      if (err) {
        mw.notify(err, {
          type: "error",
        });
        return;
      }
      const previewDialog = $("<div>")
        .css({
          maxHeight: "70vh",
          maxWidth: "80vw",
        })
        .dialog({
          title: "プレビュー",
          height: "auto",
          width: "auto",
          modal: true,
          dialogClass: "wks-csrd-dialog-preview",
          close: function () {
            $(this).empty().dialog("destroy");
          },
        });
      const previewContent = $("<div>")
        .prop("id", "wks-dialog-preview-content")
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
      previewDialog.dialog({
        position: {
          my: "center",
          at: "center",
          of: window,
        },
      });
    };

    dialogButton.on("click", async (e) => {
      e.preventDefault();
      await execute();
    });

    previewButton.on("click", async (e) => {
      e.preventDefault();
      await preview();
    });

    cancelButton.on("click", (e) => {
      e.preventDefault();
      $("#csrd-box").remove();
      opened = false;
      document.querySelectorAll(".mw-changeslist-date").forEach((el, i) => {
        el.removeEventListener("click", functions[i]!);
        if (el.classList.contains("wks-revision-selected")) {
          el.classList.remove("wks-revision-selected");
        }
      });
    });
  });
}
