import {
  SCRIPT_NAME,
  SKJ_REQUEST_PAGE_NAME,
  SUMMARY_AD,
  SUMMARY_AD_ATTRACT,
} from "@/constants";
import {
  createPortletLink,
  createRowFunc,
  getImage,
  getOptionProperty,
  sleep,
} from "@/util";

export async function initSkj() {
  const revisionId = mw.config.get("wgRevisionId");

  const skjPortlet = createPortletLink("削除依頼", "wks-skj", "削除依頼をする");

  if (!skjPortlet) {
    console.warn(`${SCRIPT_NAME}: メニューの作成に失敗しました。`);
    return;
  }

  skjPortlet.addEventListener("click", async (e) => {
    e.preventDefault();

    const createRow = createRowFunc("skj");
    const skjDialog = $("<div>");
    skjDialog.css("max-height", "70vh").dialog({
      dialogClass: "wks-skj-dialog",
      title: `${SCRIPT_NAME} - 削除依頼`,
      resizable: false,
      height: "auto",
      width: "auto",
      modal: true,
      close: function () {
        $(this).empty().dialog("destroy");
      },
    });
    const dialogContent = $("<div>")
      .prop("id", "wks-skj-dialog-content")
      .text("読み込み中")
      .append(getImage("load", "margin-left: 0.5em;"));
    skjDialog.append(dialogContent);
    const [pageRes, existRFDPage] = await Promise.all([
      new mw.Api().post({
        action: "query",
        format: "json",
        prop: "revisions",
        list: "",
        titles: mw.config.get("wgPageName"),
        formatversion: "2",
        rvprop: "content",
        rvslots: "main",
      }),
      new mw.Api().post({
        action: "query",
        format: "json",
        titles: SKJ_REQUEST_PAGE_NAME + mw.config.get("wgPageName"),
        formatversion: "2",
      }),
    ]);
    const pageContent = pageRes.query.pages[0].revisions[0].slots.main.content;
    dialogContent.empty();
    const dialogFieldset = $("<fieldset>");
    dialogFieldset.prop({
      id: "wks-skj-dialog-optionfield",
      innerHTML: "<legend>削除依頼の提出</legend>",
    });
    dialogContent.append(dialogFieldset);
    const dialogPageNameRow = createRow("page-name");
    dialogPageNameRow.append(
      $("<label>")
        .html("ページ名")
        .prop("for", "wks-skj-dialog-page-name-input"),
    );
    const dialogPageNameDiv = $("<div>").addClass("wks-inline");
    dialogPageNameDiv.append(
      $("<span>").text(SKJ_REQUEST_PAGE_NAME).addClass("wks-shrink-0"),
    );
    const yyyymmdd = new Date().toISOString().split("T")[0]!.replace(/-/g, "");
    dialogPageNameDiv.append(
      $("<input>").prop({
        id: "wks-skj-dialog-page-name-input",
        type: "text",
        placeholder: "ページ名",
        style: "width: 100%;",
        value: existRFDPage.query.pages[0].missing
          ? mw.config.get("wgPageName")
          : `${mw.config.get("wgPageName")} ${yyyymmdd}`,
      }),
    );
    if (!existRFDPage.query.pages[0].missing) {
      mw.notify(
        "すでに削除依頼ページが存在していたので、サブページ名に日付を追加しました。",
      );
    }
    dialogPageNameRow.append(dialogPageNameDiv);
    dialogFieldset.append(dialogPageNameRow);
    const dialogCRRow = createRow("cr").addClass("wks-inline");
    dialogCRRow.append(
      $("<input>").prop({ id: "wks-skj-dialog-cr-cb", type: "checkbox" }),
    );
    dialogCRRow.append(
      $("<label>")
        .html(
          '{{<a href="/wiki/Template:Copyrights">Copyrights</a>}}を貼り付ける',
        )
        .prop("for", "wks-skj-dialog-cr-cb"),
    );
    const dialogBlankRow = createRow("blank").addClass("wks-inline");
    dialogBlankRow.append(
      $("<input>").prop({ id: "wks-skj-dialog-blank-cb", type: "checkbox" }),
    );
    dialogBlankRow.append(
      $("<label>")
        .html("ページをテンプレートで置き換える(元ページの内容を削除する)")
        .prop("for", "wks-skj-dialog-blank-cb"),
    );
    const dialogUseIdRow = createRow("use-id").addClass("wks-inline");
    dialogUseIdRow.append(
      $("<input>").prop({ id: "wks-skj-dialog-use-id-cb", type: "checkbox" }),
    );
    dialogUseIdRow.append(
      $("<label>")
        .html(
          "ページ名を使用せず、ページIDを使用する (サブページ名に名称を入れないようにしてください！)",
        )
        .prop("for", "wks-skj-dialog-use-id-cb"),
    );
    dialogFieldset.append(dialogCRRow);
    dialogFieldset.append(dialogBlankRow);
    dialogFieldset.append(dialogUseIdRow);

    dialogFieldset.append($("<hr>").addClass("wks-hr"));

    const dialogMarkRights = createRow("mark-rights").addClass("wks-inline");
    dialogMarkRights.append(
      $("<input>").prop({
        id: "wks-skj-dialog-mark-rights-cb",
        type: "checkbox",
      }),
    );
    dialogMarkRights.append(
      $("<label>")
        .html("権利侵害 (*)")
        .prop("for", "wks-skj-dialog-mark-rights-cb"),
    );
    const dialogMarkEmer = createRow("mark-emer").addClass("wks-inline");
    dialogMarkEmer.append(
      $("<input>").prop({
        id: "wks-skj-dialog-mark-emer-cb",
        type: "checkbox",
      }),
    );
    dialogMarkEmer.append(
      $("<label>")
        .html("緊急案件 (緊)")
        .prop("for", "wks-skj-dialog-mark-emer-cb"),
    );
    const dialogMarkRev = createRow("mark-rev").addClass("wks-inline");
    dialogMarkRev.append(
      $("<input>").prop({ id: "wks-skj-dialog-mark-rev-cb", type: "checkbox" }),
    );
    dialogMarkRev.append(
      $("<label>")
        .html("版指定削除 (特)")
        .prop("for", "wks-skj-dialog-mark-rev-cb"),
    );

    dialogFieldset.append(dialogMarkRights);
    dialogFieldset.append(dialogMarkEmer);
    dialogFieldset.append(dialogMarkRev);

    dialogFieldset.append($("<hr>").addClass("wks-hr"));

    const dialogDescRow = createRow("desc");
    dialogDescRow.append(
      $("<label>").html("理由").prop("for", "wks-skj-dialog-desc-input"),
    );
    dialogDescRow.append(
      $("<textarea>").prop({
        id: "wks-skj-dialog-desc-input",
        placeholder: "ケースE、特筆性なし。〜〜〜",
        style: "width: 100%;",
      }),
    );
    dialogFieldset.append(dialogDescRow);

    const dialogOPVRow = createRow("opv");
    dialogOPVRow.append(
      $("<label>")
        .html("依頼者票 (署名不要)")
        .prop("for", "wks-skj-dialog-opv-input"),
    );
    dialogOPVRow.append(
      $("<input>").prop({
        id: "wks-skj-dialog-opv-input",
        placeholder: "{{AFD|削除}} 依頼者票。",
        style: "width: 100%;",
        value: getOptionProperty("skj.default.opv") || "",
      }),
    );
    const preset = $("<div>").addClass("wks-inline");
    preset.html(
      `プリセット: ${getOptionProperty("skj.opvPresets")
        .map(
          (x: { name: string; value: string }, i: number) =>
            `<button id="wks-skj-preset-id${i}">${x.name}</button>`,
        )
        .join(" ")}`,
    );
    dialogOPVRow.append(preset);
    dialogFieldset.append(dialogOPVRow);

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
        .html("Sakujo貼り付け: ")
        .prop("for", "wks-skj-dialog-summary-template")
        .addClass("wks-shrink-0"),
    );
    summaryTemplate.append(
      $("<input>").prop({
        id: "wks-skj-dialog-summary-template",
        type: "text",
        placeholder: "+Sakujo",
        style: "width: 100%;",
        value: getOptionProperty("skj.default.summaryTemplate"),
      }),
    );
    dialogSummaries.append(summaryTemplate);
    const summarySubmit = $("<div>").addClass("wks-inline");
    summarySubmit.append(
      $("<label>")
        .html("依頼ページ作成: ")
        .prop("for", "wks-skj-dialog-summary-submit")
        .addClass("wks-shrink-0"),
    );
    summarySubmit.append(
      $("<input>").prop({
        id: "wks-skj-dialog-summary-submit",
        type: "text",
        placeholder: "削除依頼",
        style: "width: 100%;",
        value: getOptionProperty("skj.default.summarySubmit"),
      }),
    );
    dialogSummaries.append(summarySubmit);
    dialogFieldset.append(dialogSummaries);
    const summaryNote = $("<div>").addClass("wks-inline");
    summaryNote.append(
      $("<label>")
        .html("ログへの追記: ")
        .prop("for", "wks-skj-dialog-summary-note")
        .addClass("wks-shrink-0"),
    );
    summaryNote.append(
      $("<input>").prop({
        id: "wks-skj-dialog-summary-note",
        type: "text",
        placeholder: "削除依頼の追加",
        style: "width: 100%;",
        value: getOptionProperty("skj.default.summaryNote"),
      }),
    );
    dialogSummaries.append(summaryNote);
    dialogFieldset.append(dialogSummaries);

    getOptionProperty("skj.opvPresets").forEach(
      (x: { name: string; value: string }, i: number) => {
        $(`#wks-skj-preset-id${i}`).on("click", () => {
          $("#wks-skj-dialog-opv-input").val(x.value);
        });
      },
    );

    // 第一タプル: prependtext か text か (true なら text, false なら prependtext)
    // forceText を true にすると text になる
    const getFinalContentPrepend = (forceText = false) =>
      [forceText || $("#wks-skj-dialog-blank-cb").prop("checked"), `${
        mw.config.get("wgNamespaceNumber") === 10 ? "<noinclude>" : ""
      }{{subst:Sakujo${
        $("#wks-skj-dialog-page-name-input").val() ==
        mw.config.get("wgPageName")
          ? ""
          : `|${$("#wks-skj-dialog-page-name-input").val()}`
      }}}${
        $("#wks-skj-dialog-cr-cb").prop("checked")
          ? `\n{{Copyrights${
              $("#wks-skj-dialog-blank-cb").prop("checked") ? "|白紙化=1" : ""
            }}}`
          : ""
      }${mw.config.get("wgNamespaceNumber") === 10 ? "</noinclude>" : "\n"}${
        !$("#wks-skj-dialog-blank-cb").prop("checked") && forceText ? pageContent : ""
      }`] as const;

    const getFinalContentRequest = () => `{{subst:新規削除依頼サブページ
|ページ名=${$("#wks-skj-dialog-use-id-cb").prop("checked") ? "" : mw.config.get("wgPageName")}
|ID=${$("#wks-skj-dialog-use-id-cb").prop("checked") ? mw.config.get("wgArticleId") : ""}
|特記号=${$("#wks-skj-dialog-mark-rights-cb").prop("checked") ? "*" : ""}${$("#wks-skj-dialog-mark-emer-cb").prop("checked") ? "緊" : ""}${$("#wks-skj-dialog-mark-rev-cb").prop("checked") ? "特" : ""}
|理由=${$("#wks-skj-dialog-desc-input").val()} ${getOptionProperty("skj.signReason") ? "--~~~~" : ""}
|依頼者票=${$("#wks-skj-dialog-opv-input").val()} --~~~~
}}`;

    const checkParams = () => {
      const errList = $("<ul>");

      if (!$("#wks-skj-dialog-page-name-input").val()) {
        errList.append($("<li>").text("ページ名を入力してください。"));
      }

      if (!$("#wks-skj-dialog-desc-input").val()) {
        errList.append($("<li>").text("理由を入力してください。"));
      }

      if (!$("#wks-skj-dialog-opv-input").val()) {
        errList.append($("<li>").text("依頼者票を入力してください。"));
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
          dialogClass: "wks-mi-dialog wks-mi-dialog-preview",
          title: `${SCRIPT_NAME} - 削除依頼`,
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
        .text("注意: 削除依頼中はタブを閉じないでください！");
      progressDialog.append(wipMessage);

      const unloadFunc = (e: BeforeUnloadEvent) => {
        e.returnValue = "During the Sakujo progress!";
      };
      addEventListener("beforeunload", unloadFunc);

      const progressDialogContentCheckExists = $("<div>")
        .prop("id", "wks-dialog-progress-content-check-exists")
        .addClass("wks-inline")
        .append(getImage("load", ""))
        .append($("<span>").text("ページの存在チェック中"));
      progressDialog.append(progressDialogContentCheckExists);

      const getPageName =
        () => SKJ_REQUEST_PAGE_NAME + $("#wks-skj-dialog-page-name-input").val();
      const pageRes = await new mw.Api().post({
        action: "query",
        format: "json",
        titles: getPageName(),
        formatversion: "2",
      });

      if (!pageRes.query.pages[0].missing) {
        progressDialogContentCheckExists.empty();
        progressDialogContentCheckExists.append(getImage("cross", ""));
        progressDialogContentCheckExists.append(
          $("<span>").html(
            `削除依頼ページが<a href="/wiki/${getPageName()}">既に存在します</a>。`,
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

      progressDialogContentCheckExists.empty();
      progressDialogContentCheckExists.append(getImage("check", ""));
      progressDialogContentCheckExists.append(
        $("<span>").html(`削除依頼ページが存在しません。`),
      );

      const progressDialogContentPrependTl = $("<div>")
        .prop("id", "wks-dialog-progress-content-prepend-tl")
        .addClass("wks-inline")
        .append(getImage("load", ""))
        .append($("<span>").text("テンプレートの貼付中"));
      progressDialog.append(progressDialogContentPrependTl);

      try {
        const [isText, t] = getFinalContentPrepend();
        const prependRes = await new mw.Api().postWithEditToken({
          action: "edit",
          title: mw.config.get("wgPageName"),
          nocreate: 1,
          text: isText ? t : undefined,
          prependtext: isText ? undefined : t,
          summary:
            ($("#wks-skj-dialog-summary-template").val() as string || "+Sakujo").replaceAll("$d", getPageName()).replaceAll("$p", mw.config.get("wgPageName")) +
            SUMMARY_AD,
          formatversion: "2",
          baserevid: revisionId,
          notminor: 1,
        });

        if (prependRes.edit.result !== "Success") {
          progressDialogContentPrependTl.empty();
          progressDialogContentPrependTl.append(getImage("cross", ""));
          progressDialogContentPrependTl.append(
            $("<span>").html(`テンプレートの貼付に失敗しました。(Conflict?)`),
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

        progressDialogContentPrependTl.empty();
        progressDialogContentPrependTl.append(getImage("check", ""));
        progressDialogContentPrependTl.append(
          $("<span>").html(`テンプレートの貼付に成功しました。`),
        );

        const progressDialogContentWait1 = $("<div>")
          .prop("id", "wks-dialog-progress-content-wait1")
          .addClass("wks-inline")
          .append(getImage("load", ""))
          .append($("<span>").text("5秒待機します..."));

        progressDialog.append(progressDialogContentWait1);

        await sleep(5000);

        progressDialogContentWait1.empty();
        progressDialogContentWait1.append(getImage("check", ""));
        progressDialogContentWait1.append($("<span>").html(`5秒待機します...`));

        const progressDialogContentSubmit = $("<div>")
          .prop("id", "wks-dialog-progress-content-submit")
          .addClass("wks-inline")
          .append(getImage("load", ""))
          .append($("<span>").text("依頼ページの作成中"));

        progressDialog.append(progressDialogContentSubmit);

        try {
          const submitRes = await new mw.Api().postWithEditToken({
            action: "edit",
            title: getPageName(),
            createonly: 1,
            text: getFinalContentRequest(),
            summary:
              ($("#wks-skj-dialog-summary-submit").val() as string || "削除依頼").replaceAll("$d", getPageName()).replaceAll("$p", mw.config.get("wgPageName")) +
              SUMMARY_AD,
            formatversion: "2",
          });

          if (submitRes.edit.result !== "Success") {
            progressDialogContentSubmit.empty();
            progressDialogContentSubmit.append(getImage("cross", ""));
            progressDialogContentSubmit.append(
              $("<span>").html(`依頼ページの作成に失敗しました。(Conflict?)`),
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

          progressDialogContentSubmit.empty();
          progressDialogContentSubmit.append(getImage("check", ""));
          progressDialogContentSubmit.append(
            $("<span>").html(
              `依頼ページの作成に成功しました。(<a href="/wiki/${getPageName()}" target="_blank">リンク</a>)`,
            ),
          );

          const progressDialogContentWait2 = $("<div>")
            .prop("id", "wks-dialog-progress-content-wait2")
            .addClass("wks-inline")
            .append(getImage("load", ""))
            .append($("<span>").text("5秒待機します..."));

          progressDialog.append(progressDialogContentWait2);

          await sleep(5000);

          progressDialogContentWait2.empty();
          progressDialogContentWait2.append(getImage("check", ""));
          progressDialogContentWait2.append(
            $("<span>").html(`5秒待機します...`),
          );

          const progressDialogContentNote = $("<div>")
            .prop("id", "wks-dialog-progress-content-note")
            .addClass("wks-inline")
            .append(getImage("load", ""))
            .append($("<span>").text("ログへの追記中"));

          progressDialog.append(progressDialogContentNote);

          const logPageName =
            SKJ_REQUEST_PAGE_NAME +
            `ログ/${new Date().getFullYear()}年${new Date().getMonth() + 1}月${new Date().getDate()}日`;

          const logPageRes = await new mw.Api().post({
            action: "query",
            format: "json",
            prop: "revisions",
            list: "",
            titles: logPageName,
            formatversion: "2",
            rvprop: "content",
            rvslots: "main",
          });

          const logPageContent =
            logPageRes.query.pages[0].revisions[0].slots.main.content.replace(
              /(\r\n|\n)+$/,
              "",
            );

          try {
            const logPageEditRes = await new mw.Api().postWithEditToken({
              action: "edit",
              title: logPageName,
              nocreate: 1,
              text: `${logPageContent}\n{{${getPageName()}}}`,
              summary:
                ($("#wks-skj-dialog-summary-note").val() as string || "削除依頼の追加").replaceAll("$d", getPageName()).replaceAll("$p", mw.config.get("wgPageName")) +
                SUMMARY_AD,
              formatversion: "2",
            });

            if (logPageEditRes.edit.result !== "Success") {
              progressDialogContentNote.empty();
              progressDialogContentNote.append(getImage("cross", ""));
              progressDialogContentNote.append(
                $("<span>").html(`ログへの追記に失敗しました。(Conflict?)`),
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

            progressDialogContentNote.empty();
            progressDialogContentNote.append(getImage("check", ""));
            progressDialogContentNote.append(
              $("<span>").html(
                `ログへの追記に成功しました。(<a href="/wiki/${logPageName}" target="_blank">リンク</a>)`,
              ),
            );
            removeEventListener("beforeunload", unloadFunc);
          } catch (e) {
            progressDialogContentNote.empty();
            progressDialogContentNote.append(getImage("cross", ""));
            progressDialogContentNote.append(
              $("<span>").html(`ログへの追記に失敗しました。(${e})`),
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
        } catch (e) {
          progressDialogContentSubmit.empty();
          progressDialogContentSubmit.append(getImage("cross", ""));
          progressDialogContentSubmit.append(
            $("<span>").html(`依頼ページの作成に失敗しました。(${e})`),
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
      } catch (e) {
        progressDialogContentPrependTl.empty();
        progressDialogContentPrependTl.append(getImage("cross", ""));
        progressDialogContentPrependTl.append(
          $("<span>").html(`テンプレートの貼付に失敗しました。(${e})`),
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
      const pageName =
      SKJ_REQUEST_PAGE_NAME + $("#wks-skj-dialog-page-name-input").val();
      const previewDialog = $("<div>")
        .css({
          maxHeight: "70vh",
          maxWidth: "80vw",
        })
        .dialog({
          dialogClass: "wks-skj-dialog wks-skj-dialog-preview",
          title: `${SCRIPT_NAME} - 削除依頼プレビュー`,
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
      const previewContent2 = $("<div>")
        .prop("id", "wks-dialog-preview-content2")
        .text("読み込み中")
        .append(getImage("load", "margin-left: 0.5em;"));
      previewDialog.append(previewContent);
      previewDialog.append($("<hr>").addClass("wks-hr"));
      previewDialog.append(previewContent2);
      const [parseRes, parseRes2] = await Promise.all([
        new mw.Api().post({
          action: "parse",
          title: mw.config.get("wgPageName"),
          text: getFinalContentPrepend(true)[1],
          summary:
            ($("#wks-skj-dialog-summary-template").val() as string || "+Sakujo").replaceAll("$d", pageName).replaceAll("$p", mw.config.get("wgPageName")) +
            SUMMARY_AD,
          prop: "text|modules|jsconfigvars",
          pst: true,
          disablelimitreport: true,
          disableeditsection: true,
          disabletoc: true,
          contentmodel: "wikitext",
          formatversion: "2",
        }),
        new mw.Api().post({
          action: "parse",
          title:
            SKJ_REQUEST_PAGE_NAME + $("#wks-skj-dialog-page-name-input").val(),
          text: getFinalContentRequest(),
          summary:
            ($("#wks-skj-dialog-summary-submit").val() as string || "削除依頼").replaceAll("$d", pageName).replaceAll("$p", mw.config.get("wgPageName")) +
            SUMMARY_AD,
          prop: "text|modules|jsconfigvars",
          pst: true,
          disablelimitreport: true,
          disableeditsection: true,
          disabletoc: true,
          contentmodel: "wikitext",
          formatversion: "2",
        }),
      ]);
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
            parseRes.parse.parsedsummary +
            "<br>注意: これはプレビューであり、依頼ページはまだ作成されていないと表示されることに留意してください。",
        )
        .prop("id", "wks-skj-dialog-preview-summary");
      const hr = $("<hr>").addClass("wks-hr");
      const previewDiv = $("<div>")
        .html(parseRes.parse.text)
        .addClass("wks-dialog-preview-div");
      previewContent.append(summaryPreview);
      previewContent.append(hr);
      previewContent.append(previewDiv);

      previewContent2.empty();
      if (parseRes2.parse.modules.length) {
        mw.loader.load(parseRes2.parse.modules);
      }
      if (parseRes2.parse.modulestyles.length) {
        mw.loader.load(parseRes2.parse.modulestyles);
      }
      const summaryPreview2 = $("<div>")
        .html("編集の要約: " + parseRes2.parse.parsedsummary)
        .prop("id", "wks-skj-dialog-preview-summary");
      const hr2 = $("<hr>").addClass("wks-hr");
      const previewDiv2 = $("<div>")
        .html(parseRes2.parse.text)
        .addClass("wks-dialog-preview-div");
      previewContent2.append(summaryPreview2);
      previewContent2.append(hr2);
      previewContent2.append(previewDiv2);

      previewDialog.dialog({
        position: {
          my: "top",
          at: "top+5%",
          of: window,
        },
      });
    };

    skjDialog.dialog({
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
            return skjDialog.dialog("close");
          },
        },
      ],
    });

    skjDialog.dialog({
      position: {
        my: "top",
        at: "top+5%",
        of: window,
      },
    });
  });
}
