import {
  RFP_REQUEST_PAGE_NAMES,
  SCRIPT_NAME,
  SUMMARY_AD,
  SUMMARY_AD_ATTRACT,
} from "@/constants";
import { openDialog } from "@/dialog";
import {
  findRequestSection,
  formatPageProtectionStatus,
  getDefaultProtectionRequestMode,
  hasActiveProtection,
  type PageProtectionStatus,
  type ProtectionRequestMode,
} from "@/rfp";
import {
  createRowFunc,
  getPageEditContext,
  getImage,
  getOptionProperty,
  pageNameToNamespace,
  sleep,
  takePortlet,
} from "@/util";

const REQUEST_MODES = {
  protect: {
    label: "保護依頼",
    requestPageName: RFP_REQUEST_PAGE_NAMES.protect,
  },
  unprotect: {
    label: "保護解除依頼",
    requestPageName: RFP_REQUEST_PAGE_NAMES.unprotect,
  },
} as const;

type ProtectionQueryResponse = {
  query?: {
    pages?: Array<{
      title?: string;
      missing?: boolean;
      protection?: PageProtectionStatus["protections"];
    }>;
  };
};

async function getPageProtectionStatus(
  title: string,
): Promise<PageProtectionStatus> {
  const response = (await new mw.Api().get({
    action: "query",
    format: "json",
    prop: "info",
    inprop: "protection",
    titles: title,
    formatversion: "2",
  })) as ProtectionQueryResponse;
  const page = response.query?.pages?.[0];

  return {
    title: page?.title ?? title,
    missing: page?.missing === true,
    protections: page?.protection ?? [],
  };
}

function getRequestSectionName() {
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
  const rfpPortlet = takePortlet("wks-rfp");
  if (!rfpPortlet) {
    console.warn(`${SCRIPT_NAME}: メニューの作成に失敗しました。`);
    return;
  }

  rfpPortlet.addEventListener("click", async (e) => {
    e.preventDefault();

    const initialPageName = mw.config.get("wgPageName");
    const requestPageContextsPromise = Promise.all([
      getPageEditContext(REQUEST_MODES.protect.requestPageName),
      getPageEditContext(REQUEST_MODES.unprotect.requestPageName),
    ]).then(([protect, unprotect]) => ({ protect, unprotect }));
    const initialProtectionStatusPromise = getPageProtectionStatus(
      initialPageName,
    ).catch(() => null);
    const createRow = createRowFunc("rfp");
    const dialogContent = $("<div>")
      .prop("id", "wks-rfp-dialog-content")
      .text("読み込み中")
      .append(getImage("load", "margin-left: 0.5em;"));
    const rfpDialog = await openDialog({
      title: `${SCRIPT_NAME} - 保護依頼 / 保護解除依頼`,
      dialogClass: "wks-rfp-dialog",
      content: dialogContent,
    });
    const [requestPageContexts, initialProtectionStatus] = await Promise.all([
      requestPageContextsPromise,
      initialProtectionStatusPromise,
    ]);
    if (
      requestPageContexts.protect.revisionId === null &&
      requestPageContexts.unprotect.revisionId === null
    ) {
      dialogContent.text("依頼ページが存在しないため編集できません。");
      rfpDialog.setButtons([
        { label: "閉じる", onClick: () => rfpDialog.close() },
      ]);
      return;
    }
    const initialMode = initialProtectionStatus
      ? getDefaultProtectionRequestMode(initialProtectionStatus)
      : "protect";
    dialogContent.empty();
    const dialogFieldset = $("<fieldset>");
    dialogFieldset.prop("id", "wks-rfp-dialog-optionfield");
    const dialogLegend = $("<legend>").text(
      `${REQUEST_MODES[initialMode].label}の提出`,
    );
    dialogFieldset.append(dialogLegend);
    dialogContent.append(dialogFieldset);

    const dialogModeRow = createRow("mode").addClass("wks-inline");
    for (const mode of ["protect", "unprotect"] as const) {
      const id = `wks-rfp-dialog-mode-${mode}`;
      dialogModeRow.append(
        $("<input>").prop({
          id,
          name: "wks-rfp-dialog-mode",
          type: "radio",
          value: mode,
          checked: mode === initialMode,
        }),
        $("<label>")
          .prop("for", id)
          .text(mode === "protect" ? "保護を依頼" : "保護解除を依頼"),
      );
    }
    dialogFieldset.append(dialogModeRow);

    const getSelectedMode = (): ProtectionRequestMode =>
      $("input[name='wks-rfp-dialog-mode']:checked").val() === "unprotect"
        ? "unprotect"
        : "protect";

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
        value: initialPageName,
      }),
    );

    dialogPageNames.append(dialogPageNameRow1);

    const dialogProtectionStatus = createRow("current-status")
      .addClass("wks-inline")
      .append(
        $("<span>").text("現在の状況:").addClass("wks-shrink-0"),
        $("<span>")
          .prop("id", "wks-rfp-dialog-current-status")
          .text(
            initialProtectionStatus
              ? formatPageProtectionStatus(initialProtectionStatus)
              : "保護状態を取得できませんでした",
          ),
      );

    const dialogAddPage = createRow("add-page").addClass("wks-inline");
    const dialogAddPageBtn = $("<button>")
      .prop("id", "wks-rfp-dialog-add-page-button")
      .text("ページを追加");
    dialogAddPage.append(dialogAddPageBtn);

    dialogFieldset.append(dialogProtectionStatus);
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
        .addClass("wks-shrink-0")
        .on("click", removeFunc);

      dialogPageNameRow.append(dialogRemovePageBtn);

      dialogPageNames.append(dialogPageNameRow);
    });

    let protectionStatusRequestId = 0;
    const refreshProtectionStatus = async () => {
      const requestId = ++protectionStatusRequestId;
      const pageName = String(
        $("#wks-rfp-dialog-page-name-1-input").val() ?? "",
      ).trim();
      const status = $("#wks-rfp-dialog-current-status");
      if (!pageName) {
        status.text("ページ名を入力してください");
        return null;
      }

      status.text("確認中...");
      try {
        const result = await getPageProtectionStatus(pageName);
        if (requestId === protectionStatusRequestId) {
          status.text(formatPageProtectionStatus(result));
        }
        return result;
      } catch {
        if (requestId === protectionStatusRequestId) {
          status.text("保護状態を取得できませんでした");
        }
        return null;
      }
    };

    $("#wks-rfp-dialog-page-name-1-input").on("change", () => {
      void refreshProtectionStatus();
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
          '{{<a href="/wiki/Template:保護依頼" target="_blank">保護依頼</a>}}を貼り付ける (複数ページの場合非推奨)',
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
        value: `{{Page|${mw.config.get("wgPageName").includes("=") ? "1=" : ""}${mw.config.get("wgPageName")}}}`,
      }),
    );

    dialogFieldset.append(dialogHeaderRow);

    const dialogDescRow = createRow("desc");
    dialogDescRow.append(
      $("<label>")
        .html("理由 (署名不要)")
        .prop("for", "wks-rfp-dialog-desc-input"),
    );
    const dialogDescInput = $("<textarea>").prop({
      id: "wks-rfp-dialog-desc-input",
      placeholder:
        "[[LTA:HOGE]]によって荒らしが断続的に行われているため、半保護を依頼します。",
      class: "wks-input-full",
    });
    dialogDescRow.append(dialogDescInput);
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
        .html("依頼ページ編集 ($p: ページ名の羅列): ")
        .prop("for", "wks-rfp-dialog-summary-submit")
        .addClass("wks-shrink-0"),
    );
    summarySubmit.append(
      $("<input>").prop({
        id: "wks-rfp-dialog-summary-submit",
        type: "text",
        placeholder: "+$p",
        class: "wks-input-full",
        value: getOptionProperty("rfp.default.summarySubmit"),
      }),
    );
    dialogSummaries.append(summarySubmit);
    dialogFieldset.append(dialogSummaries);

    const updateModeFields = () => {
      const mode = getSelectedMode();
      const isProtect = mode === "protect";
      dialogLegend.text(`${REQUEST_MODES[mode].label}の提出`);
      dialogTemplateRow.toggle(isProtect);
      summaryTemplate.toggle(isProtect);
      dialogDescInput.prop(
        "placeholder",
        isProtect
          ? "[[LTA:HOGE]]によって荒らしが断続的に行われているため、半保護を依頼します。"
          : "ノートで合意が形成されたため、保護解除を依頼します。",
      );
    };
    dialogModeRow.on("change", () => {
      updateModeFields();
    });
    updateModeFields();

    const getFinalContentPrepend = (namespace: number, _header: string) =>
      `${
        namespace === 10 ? "<noinclude>" : ""
      }{{保護依頼}}${namespace === 10 ? "</noinclude>" : "\n"}`;

    const getPageNames = () =>
      pages.map((pageNumber) =>
        String(
          $(`#wks-rfp-dialog-page-name-${pageNumber}-input`).val() ?? "",
        ).trim(),
      );

    const getFinalContentRequest = () =>
      `==== ${$("#wks-rfp-dialog-header-input").val()} ====\n${
        pages.length === 1
          ? ""
          : pages.length > 3
            ? `{{MultiProtect\n${
                pages
                  .map((pageNumber, i) => {
                    return `|${
                      (
                        $(
                          "#wks-rfp-dialog-page-name-" + pageNumber + "-input",
                        ).val() as string
                      ).includes("=")
                        ? `${i + 1}=`
                        : ""
                    }${$(
                      "#wks-rfp-dialog-page-name-" + pageNumber + "-input",
                    ).val()}`;
                  })
                  .join("\n") + "\n}}\n"
              }`
            : pages
                .map((pageNumber) => {
                  return `* {{Page|${
                    (
                      $(
                        "#wks-rfp-dialog-page-name-" + pageNumber + "-input",
                      ).val() as string
                    ).includes("=")
                      ? "1="
                      : ""
                  }${$(
                    "#wks-rfp-dialog-page-name-" + pageNumber + "-input",
                  ).val()}}}`;
                })
                .join("\n") + "\n"
      }${$("#wks-rfp-dialog-desc-input").val()} --~~~~`;

    const checkParams = async () => {
      const errList = $("<ul>");
      const pageNames = getPageNames();

      if (pageNames.some((pageName) => !pageName)) {
        errList.append($("<li>").text("ページ名を入力してください。"));
      }

      if (!$("#wks-rfp-dialog-desc-input").val()) {
        errList.append($("<li>").text("理由を入力してください。"));
      }

      const mode = getSelectedMode();
      if (requestPageContexts[mode].revisionId === null) {
        errList.append(
          $("<li>").text(
            `${REQUEST_MODES[mode].requestPageName}が存在しません。`,
          ),
        );
      }

      if (mode === "unprotect" && !errList.children().length) {
        try {
          const statuses = await Promise.all(
            pageNames.map((pageName) => getPageProtectionStatus(pageName)),
          );
          protectionStatusRequestId++;
          const firstStatus = statuses[0];
          if (firstStatus) {
            $("#wks-rfp-dialog-current-status").text(
              formatPageProtectionStatus(firstStatus),
            );
          }
          statuses.forEach((status, index) => {
            if (!hasActiveProtection(status)) {
              errList.append(
                $("<li>").text(
                  `${pageNames[index]}は保護されていないため、保護解除を依頼できません。`,
                ),
              );
            }
          });
        } catch {
          errList.append(
            $("<li>").text(
              "保護状態を取得できなかったため、保護解除を依頼できません。",
            ),
          );
        }
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
      const err = await checkParams();
      if (err !== true) {
        mw.notify(err, { type: "error" });
        return;
      }
      const mode = getSelectedMode();
      const requestMode = REQUEST_MODES[mode];
      const requestPageContext = requestPageContexts[mode];

      const progressContentHolder = $("<div>").css({
        maxHeight: "70vh",
        maxWidth: "80vw",
      });
      const progressDialog = await openDialog({
        title: `${SCRIPT_NAME} - ${requestMode.label}`,
        dialogClass: "wks-rfp-dialog wks-rfp-dialog-preview",
        content: progressContentHolder,
      });

      progressDialog.reposition();

      const wipMessage = $("<p>")
        .addClass("wks-red")
        .css("font-weight", "bold")
        .text(`注意: ${requestMode.label}中はタブを閉じないでください！`);
      progressContentHolder.append(wipMessage);

      const unloadFunc = (e: BeforeUnloadEvent) => {
        e.returnValue = "During the RFP progress!";
      };
      addEventListener("beforeunload", unloadFunc);

      const progressDialogContentSubmitRFP = $("<div>")
        .prop("id", "wks-dialog-progress-submit-rfp")
        .addClass("wks-inline")
        .append(getImage("load", ""))
        .append($("<span>").text(`${requestMode.label}中`));
      progressContentHolder.append(progressDialogContentSubmitRFP);

      try {
        const pageName = requestMode.requestPageName;
        const parseResult = await new mw.Api().post({
          action: "parse",
          oldid: requestPageContext.revisionId,
          prop: "sections",
          formatversion: "2",
        });
        const section = findRequestSection(
          parseResult.parse.sections,
          pageName,
          getRequestSectionName(),
        );
        if (!section) {
          throw new Error(`${requestMode.label}先の節が見つかりません。`);
        }

        const result = await new mw.Api().postWithEditToken({
          action: "edit",
          format: "json",
          title: pageName,
          section: section.index,
          summary:
            ($("#wks-rfp-dialog-summary-submit").val() as string).replaceAll(
              "$p",
              getPageNames()
                .map((x) => `[[特別:PageHistory/${x}|${x}]]`)
                .join(", "),
            ) + SUMMARY_AD,
          nocreate: 1,
          appendtext: `\n\n${getFinalContentRequest()}`,
          formatversion: "2",
          baserevid: requestPageContext.revisionId,
          starttimestamp: requestPageContext.startTimestamp,
        });

        if (result.edit.result !== "Success") {
          progressDialogContentSubmitRFP.empty();
          progressDialogContentSubmitRFP.append(getImage("cross", ""));
          progressDialogContentSubmitRFP.append(
            $("<span>").html(
              `${requestMode.label}ページの編集に失敗しました: ${JSON.stringify(result.edit)}`,
            ),
          );
          progressDialog.setButtons([
            {
              label: "閉じる",
              onClick: () => progressDialog.close(),
            },
          ]);
          removeEventListener("beforeunload", unloadFunc);
          return;
        }

        progressDialogContentSubmitRFP.empty();
        progressDialogContentSubmitRFP.append(getImage("check", ""));
        progressDialogContentSubmitRFP.append(
          $("<span>").html(
            `${requestMode.label}ページの編集に成功しました: <a href="/wiki/${pageName}">${pageName}</a>`,
          ),
        );

        if (
          mode === "unprotect" ||
          !$("#wks-rfp-dialog-template-cb").prop("checked")
        ) {
          progressDialog.setButtons([
            {
              label: "閉じる",
              onClick: () => progressDialog.close(),
            },
          ]);
          removeEventListener("beforeunload", unloadFunc);
        } else {
          const progressDialogContentWait1 = $("<div>")
            .prop("id", "wks-dialog-progress-content-wait1")
            .addClass("wks-inline")
            .append(getImage("load", ""))
            .append($("<span>").text("5秒待機します..."));

          progressContentHolder.append(progressDialogContentWait1);

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

          progressContentHolder.append(progressDialogContentTemplate);

          const pageNames = getPageNames();

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
                starttimestamp: requestPageContext.startTimestamp,
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
                progressContentHolder.append(progressDialogContentTemplateFail);
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
              progressContentHolder.append(progressDialogContentTemplateFail);
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

          progressDialog.setButtons([
            {
              label: "閉じる",
              onClick: () => progressDialog.close(),
            },
          ]);
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
          $("<span>").html(
            `${requestMode.label}ページの編集に失敗しました: ${e}`,
          ),
        );
        progressDialog.setButtons([
          {
            label: "閉じる",
            onClick: () => progressDialog.close(),
          },
        ]);
        removeEventListener("beforeunload", unloadFunc);
        return;
      }
    };

    const preview = async () => {
      const err = await checkParams();
      if (err !== true) {
        mw.notify(err, { type: "error" });
        return;
      }
      const mode = getSelectedMode();
      const requestMode = REQUEST_MODES[mode];
      const pageName = requestMode.requestPageName;
      const previewContentHolder = $("<div>").css({
        maxHeight: "70vh",
        maxWidth: "80vw",
      });
      const previewDialog = await openDialog({
        title: `${SCRIPT_NAME} - ${requestMode.label}プレビュー`,
        dialogClass: "wks-rfp-dialog wks-rfp-dialog-preview",
        content: previewContentHolder,
      });
      const previewContent = $("<div>")
        .prop("id", "wks-dialog-preview-content")
        .text("読み込み中")
        .append(getImage("load", "margin-left: 0.5em;"));
      previewContentHolder.append(previewContent);
      const parseRes = await new mw.Api().post({
        action: "parse",
        title: pageName,
        text: getFinalContentRequest(),
        summary:
          (
            ($("#wks-rfp-dialog-summary-submit").val() as string) || "+$p"
          ).replaceAll(
            "$p",
            getPageNames()
              .map((x) => `[[特別:PageHistory/${x}|${x}]]`)
              .join(", "),
          ) + SUMMARY_AD,
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
        .html("編集の要約: " + parseRes.parse.parsedsummary)
        .prop("id", "wks-rfp-dialog-preview-summary");
      const hr = $("<hr>").addClass("wks-hr");
      const previewDiv = $("<div>")
        .html(parseRes.parse.text)
        .addClass("wks-dialog-preview-div");
      previewContent.append(summaryPreview);
      previewContent.append(hr);
      previewContent.append(previewDiv);

      previewDialog.reposition();
    };

    rfpDialog.setButtons([
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
        onClick: () => rfpDialog.close(),
      },
    ]);

    rfpDialog.reposition();
  });
}
