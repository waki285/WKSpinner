import {
  SCRIPT_NAME,
  SUMMARY_AD,
  SUMMARY_AD_ATTRACT,
} from "@/constants";
import {
  createPortletLink,
  createRowFunc,
  getImage,
  getOptionProperty,
  lib,
  pageNameToNamespace,
  sleep,
} from "@/util";

function getProtectSectionName() {
  const date = new Date();
  let kikan: string;
  const day = date.getDate();
  if (day < 11) {
    kikan = "上旬";
  } else if (day < 21) {
    kikan = "中旬";
  } else {
    kikan = "下旬";
  }
  return `${date.getMonth() + 1}月${kikan}`;
}

export async function initRFP() {
  const rfpPortlet = createPortletLink("保護依頼", "wks-rfp", "保護依頼をする");

  if (!rfpPortlet) {
    console.warn(`${SCRIPT_NAME}: メニューの作成に失敗しました。`);
    return;
  }

  rfpPortlet.addEventListener("click", async (e) => {
    e.preventDefault();

    const createRow = createRowFunc("rfp");
    const rfpDialog = $("<div>");
    rfpDialog.css("max-height", "70vh").dialog({
      dialogClass: "wks-rfp-dialog",
      title: `${SCRIPT_NAME} - 保護依頼`,
      resizable: false,
      height: "auto",
      width: "auto",
      modal: true,
      close: function () {
        $(this).empty().dialog("destroy");
      },
    });
    const dialogContent = $("<div>").prop("id", "wks-rfp-dialog-content");
    rfpDialog.append(dialogContent);
    dialogContent.empty();
    const dialogFieldset = $("<fieldset>");
    dialogFieldset.prop({
      id: "wks-rfp-dialog-optionfield",
      innerHTML: "<legend>保護依頼の提出</legend>",
    });
    dialogContent.append(dialogFieldset);
    const pages = [1];
    const dialogPageNames = createRow("page-names");
    const dialogPageNameRow1 = createRow("page-name-1")
      .addClass("wks-inline")
      .addClass("wks-mb-1");
    dialogPageNameRow1.append(
      $("<label>")
        .html("ページ")
        .prop("for", "wks-rfp-dialog-page-name-1-input")
        .addClass("wks-shrink-0"),
    );

    dialogPageNameRow1.append(
      $("<input>").prop({
        id: "wks-rfp-dialog-page-name-1-input",
        type: "text",
        placeholder: "ページ名",
        class: "wks-input-full",
        value: mw.config.get("wgPageName"),
      }),
    );

    dialogPageNames.append(dialogPageNameRow1);

    const dialogAddPage = createRow("add-page").addClass("wks-inline");
    const dialogAddPageBtn = $("<button>")
      .prop("id", "wks-rfp-dialog-add-page-button")
      .text("ページを追加");
    dialogAddPage.append(dialogAddPageBtn);

    dialogFieldset.append(dialogPageNames);
    dialogFieldset.append(dialogAddPage);

    dialogAddPageBtn.on("click", () => {
      const num = pages.length + 1;
      pages.push(num);
      const dialogPageNameRow = createRow(`page-name-${num}`)
        .addClass("wks-inline")
        .addClass("wks-mb-1");
      dialogPageNameRow.append(
        $("<label>")
          .html("ページ")
          .prop("for", `wks-rfp-dialog-page-name-${num}-input`)
          .addClass("wks-shrink-0"),
      );
      dialogPageNameRow.append(
        $("<input>").prop({
          id: `wks-rfp-dialog-page-name-${num}-input`,
          type: "text",
          placeholder: "ページ名",
          class: "wks-input-full",
        }),
      );

      const removeFunc = () => {
        dialogPageNameRow.remove();
        // dialogAddPageBtn.remove(); // why?
        pages.splice(pages.indexOf(num), 1);
      };

      const dialogRemovePageBtn = $("<button>")
        .prop("id", `wks-rfp-dialog-remove-page-${num}-button`)
        .text("削除")
        .on("click", removeFunc);

      dialogPageNameRow.append(dialogRemovePageBtn);

      dialogPageNames.append(dialogPageNameRow);
    });

    const dialogTemplateRow = createRow("template").addClass("wks-inline");
    dialogTemplateRow.append(
      $("<input>").prop({
        id: "wks-rfp-dialog-template-cb",
        type: "checkbox",
        checked: true,
      }),
    );
    dialogTemplateRow.append(
      $("<label>")
        .html(
          '{{<a href="/wiki/Template:保護依頼">保護依頼</a>}}を貼り付ける (複数ページの場合非推奨)',
        )
        .prop("for", "wks-rfp-dialog-template-cb"),
    );
    dialogFieldset.append(dialogTemplateRow);

    dialogFieldset.append($("<hr>").addClass("wks-hr"));

    const dialogHeaderRow = createRow("header");
    dialogHeaderRow.append(
      $("<label>").html("見出し").prop("for", "wks-rfp-dialog-header-input"),
    );
    dialogHeaderRow.append(
      $("<input>").prop({
        id: "wks-rfp-dialog-header-input",
        type: "text",
        placeholder: "保護依頼",
        class: "wks-input-full",
        value: `{{Page|${mw.config.get("wgPageName").includes("=") ? "1=":""}${mw.config.get("wgPageName")}}}`,
      }),
    );

    dialogFieldset.append(dialogHeaderRow);

    const dialogDescRow = createRow("desc");
    dialogDescRow.append(
      $("<label>")
        .html("理由 (署名不要)")
        .prop("for", "wks-rfp-dialog-desc-input"),
    );
    dialogDescRow.append(
      $("<textarea>").prop({
        id: "wks-rfp-dialog-desc-input",
        placeholder:
          "[[LTA:HOGE]]によって荒らしが断続的に行われているため、半保護を依頼します。",
        class: "wks-input-full",
      }),
    );
    dialogFieldset.append(dialogDescRow);

    const dialogSummaries = createRow("summaries");
    dialogSummaries.append(
      $("<span>")
        .html(
          "編集の要約 「" + SUMMARY_AD_ATTRACT + "」 が自動付加されます 任意",
        )
        .addClass("wks-shrink-0"),
    );
    const summaryTemplate = $("<div>").addClass("wks-inline");
    summaryTemplate.append(
      $("<label>")
        .html("保護依頼貼り付け: ")
        .prop("for", "wks-rfp-dialog-summary-template")
        .addClass("wks-shrink-0"),
    );
    summaryTemplate.append(
      $("<input>").prop({
        id: "wks-rfp-dialog-summary-template",
        type: "text",
        placeholder: "+保護依頼",
        class: "wks-input-full",
        value: getOptionProperty("rfp.default.summaryTemplate"),
      }),
    );
    dialogSummaries.append(summaryTemplate);
    const summarySubmit = $("<div>").addClass("wks-inline");
    summarySubmit.append(
      $("<label>")
        .html("依頼ページ編集: ")
        .prop("for", "wks-rfp-dialog-summary-submit")
        .addClass("wks-shrink-0"),
    );
    summarySubmit.append(
      $("<input>").prop({
        id: "wks-rfp-dialog-summary-submit",
        type: "text",
        placeholder: "保護依頼",
        class: "wks-input-full",
        value: getOptionProperty("rfp.default.summarySubmit"),
      }),
    );
    dialogSummaries.append(summarySubmit);
    dialogFieldset.append(dialogSummaries);

    const getFinalContentPrepend = (namespace: number, _header: string) =>
      `${
        namespace === 10 ? "<noinclude>" : ""
      }{{保護依頼}}${namespace === 10 ? "</noinclude>" : "\n"}`;

    const getFinalContentRequest = () =>
      `==== ${$("#wks-rfp-dialog-header-input").val()} ====\n${
        pages.length === 1
          ? ""
          : pages
              .map((pageNumber) => {
                return `* {{Page|1=${$(
                  "#wks-rfp-dialog-page-name-" + pageNumber + "-input",
                ).val()}}}`;
              })
              .join("\n") + "\n"
      }${$("#wks-rfp-dialog-desc-input").val()} --~~~~`;

    const checkParams = () => {
      const errList = $("<ul>");

      if (!$("#wks-rfp-dialog-page-name-1-input").val()) {
        errList.append($("<li>").text("ページ名を入力してください。"));
      }

      if (!$("#wks-rfp-dialog-desc-input").val()) {
        errList.append($("<li>").text("理由を入力してください。"));
      }

      if (errList.children().length) {
        return $("<div>")
          .append($("<p>").text("入力にエラーがあります。"))
          .append(errList);
      } else {
        return true;
      }
    };

    const execute = async () => {
      const err = checkParams();
      if (err !== true) {
        mw.notify(err, { type: "error" });
        return;
      }

      const progressDialog = $("<div>")
        .css({
          maxHeight: "70vh",
          maxWidth: "80vw",
        })
        .dialog({
          dialogClass: "wks-rfp-dialog wks-rfp-dialog-preview",
          title: `${SCRIPT_NAME} - 保護依頼`,
          height: "auto",
          width: "auto",
          modal: true,
          close: function () {
            $(this).empty().dialog("destroy");
          },
        });

      progressDialog.dialog({
        position: {
          my: "center",
          at: "center",
          of: window,
        },
      });

      const wipMessage = $("<p>")
        .addClass("wks-red")
        .css("font-weight", "bold")
        .text("注意: 保護依頼中はタブを閉じないでください！");
      progressDialog.append(wipMessage);

      const unloadFunc = (e: BeforeUnloadEvent) => {
        e.returnValue = "During the RFP progress!";
      };
      addEventListener("beforeunload", unloadFunc);

      const progressDialogContentSubmitRFP = $("<div>")
        .prop("id", "wks-dialog-progress-submit-rfp")
        .addClass("wks-inline")
        .append(getImage("load", ""))
        .append($("<span>").text("保護依頼中"));
      progressDialog.append(progressDialogContentSubmitRFP);

      const pageName = "Wikipedia:保護依頼";
      const nft = await lib.Wikitext.newFromTitle(pageName);
      const sections = nft.parseSections();

      try {
        const result = await new mw.Api().postWithEditToken({
          action: "edit",
          format: "json",
          title: pageName,
          section: sections
            .find((section: { title: string }) =>
              section.title.includes(getProtectSectionName()),
            )
            .index.toString(),
          summary: $("#wks-rfp-dialog-summary-submit").val() + SUMMARY_AD,
          nocreate: 1,
          appendtext: `\n${getFinalContentRequest()}`,
          formatversion: "2",
        });

        if (result.edit.result !== "Success") {
          progressDialogContentSubmitRFP.empty();
          progressDialogContentSubmitRFP.append(getImage("cross", ""));
          progressDialogContentSubmitRFP.append(
            $("<span>").html(
              `保護依頼ページの編集に失敗しました: ${JSON.stringify(result.edit)}`,
            ),
          );
          progressDialog.dialog({
            buttons: [
              {
                text: "閉じる",
                click: function () {
                  return progressDialog.dialog("close");
                },
              },
            ],
          });
          removeEventListener("beforeunload", unloadFunc);
          return;
        }

        progressDialogContentSubmitRFP.empty();
        progressDialogContentSubmitRFP.append(getImage("check", ""));
        progressDialogContentSubmitRFP.append(
          $("<span>").html(
            `保護依頼ページの編集に成功しました: <a href="/wiki/${pageName}">${pageName}</a>`,
          ),
        );

        if (!$("#wks-rfp-dialog-template-cb").val()) {
          progressDialog.dialog({
            buttons: [
              {
                text: "閉じる",
                click: function () {
                  return progressDialog.dialog("close");
                },
              },
            ],
          });
          removeEventListener("beforeunload", unloadFunc);
        } else {
          const progressDialogContentWait1 = $("<div>")
            .prop("id", "wks-dialog-progress-content-wait1")
            .addClass("wks-inline")
            .append(getImage("load", ""))
            .append($("<span>").text("5秒待機します..."));

          progressDialog.append(progressDialogContentWait1);

          await sleep(5000);

          progressDialogContentWait1.empty();
          progressDialogContentWait1.append(getImage("check", ""));
          progressDialogContentWait1.append(
            $("<span>").html(`5秒待機します...`),
          );

          const progressDialogContentTemplate = $("<div>")
            .prop("id", "wks-dialog-progress-content-template")
            .addClass("wks-inline")
            .append(getImage("load", ""))
            .append(
              $("<span>").text(
                `保護依頼テンプレートの貼り付け中 (ページ数: ${pages.length}, 成功: 0, 失敗: 0)`,
              ),
            );
          let success = 0;
          let failure = 0;

          progressDialog.append(progressDialogContentTemplate);

          const pageNames = pages.map(
            (pageNumber) =>
              $(
                "#wks-rfp-dialog-page-name-" + pageNumber + "-input",
              ).val() as string,
          );

          for (const pageName of pageNames) {
            const header = $("#wks-rfp-dialog-header-input").val() as string;
            const finalContent = getFinalContentPrepend(
              pageNameToNamespace(pageName)!,
              header,
            );

            try {
              const result = await new mw.Api().postWithEditToken({
                action: "edit",
                format: "json",
                title: pageName,
                summary:
                  $("#wks-rfp-dialog-summary-template").val() + SUMMARY_AD,
                prependtext: finalContent,
                nocreate: true,
                formatversion: "2",
              });

              if (result.edit.result !== "Success") {
                const progressDialogContentTemplateFail = $("<div>")
                  .prop(
                    "id",
                    `wks-dialog-progress-content-template-fail-${Date.now()}`,
                  )
                  .addClass("wks-inline");
                progressDialogContentTemplateFail.append(getImage("cross", ""));
                progressDialogContentTemplateFail.append(
                  $("<span>").html(
                    `保護依頼テンプレートの貼り付けに失敗しました: ${pageName}: ${JSON.stringify(
                      result.edit,
                    )}`,
                  ),
                );
                progressDialog.append(progressDialogContentTemplateFail);
                failure++;
              } else {
                success++;
              }
            } catch (e) {
              const progressDialogContentTemplateFail = $("<div>")
                .prop(
                  "id",
                  `wks-dialog-progress-content-template-fail-${Date.now()}`,
                )
                .addClass("wks-inline");
              progressDialogContentTemplateFail.append(getImage("cross", ""));
              progressDialogContentTemplateFail.append(
                $("<span>").html(
                  `保護依頼テンプレートの貼り付けに失敗しました: ${pageName}: ${e}`,
                ),
              );
              progressDialog.append(progressDialogContentTemplateFail);
              failure++;
            } finally {
              progressDialogContentTemplate.empty();
              progressDialogContentTemplate.append(getImage("load", ""));
              progressDialogContentTemplate.append(
                $("<span>").text(
                  `保護依頼テンプレートの貼り付け中 (ページ数: ${pages.length}, 成功: ${success}, 失敗: ${failure})`,
                ),
              );
            }
            await sleep(3000);
          }

          progressDialog.dialog({
            buttons: [
              {
                text: "閉じる",
                click: function () {
                  return progressDialog.dialog("close");
                },
              },
            ],
          });
          progressDialogContentTemplate.empty();
          progressDialogContentTemplate.append(getImage("check", ""));
          progressDialogContentTemplate.append(
            $("<span>").text(
              `保護依頼テンプレートの貼り付けが完了しました (ページ数: ${pages.length}, 成功: ${success}, 失敗: ${failure})`,
            ),
          );
          removeEventListener("beforeunload", unloadFunc);
        }
      } catch (e) {
        progressDialogContentSubmitRFP.empty();
        progressDialogContentSubmitRFP.append(getImage("cross", ""));
        progressDialogContentSubmitRFP.append(
          $("<span>").html(`保護依頼ページの編集に失敗しました: ${e}`),
        );
        progressDialog.dialog({
          buttons: [
            {
              text: "閉じる",
              click: function () {
                return progressDialog.dialog("close");
              },
            },
          ],
        });
        removeEventListener("beforeunload", unloadFunc);
        return;
      }
    };

    const preview = async () => {
      const err = checkParams();
      if (err !== true) {
        mw.notify(err, { type: "error" });
        return;
      }
      const pageName = "Wikipedia:保護依頼";
      const previewDialog = $("<div>")
        .css({
          maxHeight: "70vh",
          maxWidth: "80vw",
        })
        .dialog({
          dialogClass: "wks-rfp-dialog wks-rfp-dialog-preview",
          title: `${SCRIPT_NAME} - 保護依頼プレビュー`,
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
      const parseRes = await new mw.Api().post({
        action: "parse",
        title: pageName,
        text: getFinalContentRequest(),
        summary:
          (($("#wks-rfp-dialog-summary-template").val() as string) || "+保護依頼") + SUMMARY_AD,
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
        .html(
          "編集の要約: " +
            parseRes.parse.parsedsummary
        )
        .prop("id", "wks-rfp-dialog-preview-summary");
      const hr = $("<hr>").addClass("wks-hr");
      const previewDiv = $("<div>")
        .html(parseRes.parse.text)
        .addClass("wks-dialog-preview-div");
      previewContent.append(summaryPreview);
      previewContent.append(hr);
      previewContent.append(previewDiv);


      previewDialog.dialog({
        position: {
          my: "top",
          at: "top+5%",
          of: window,
        },
      });
    };

    rfpDialog.dialog({
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
            return rfpDialog.dialog("close");
          },
        },
      ],
    });

    rfpDialog.dialog({
      position: {
        my: "top",
        at: "top+5%",
        of: window,
      },
    });
  });
}
