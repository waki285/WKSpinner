import {
  RFD_REQUEST_PAGE_NAME,
  SCRIPT_NAME,
  SKJ_REQUEST_PAGE_NAME,
  SUMMARY_AD,
  SUMMARY_AD_ATTRACT,
  UFD_REQUEST_PAGE_NAME,
} from "@/constants";
import { openDialog } from "@/dialog";
import {
  createRowFunc,
  getPageEditContext,
  getImage,
  getOptionProperty,
  sleep,
  takePortlet,
} from "@/util";
import { getPageIdPrivacyWarnings } from "@/skj-validation";
import {
  appendRedirectDeletionRequest,
  fetchCurrentRedirectTarget,
  getDeletionRequestReason,
  getRedirectDeletionRequestSectionHeading,
  getRedirectDeletionRequestText,
  getUserPageDeletionReference,
  getUserPageDeletionRequestSection,
  getUserPageDeletionRequestText,
  getUserPageDeletionSectionTitle,
  hasUserPageDeletionRequest,
  hasRedirectDeletionRequest,
  isUserPageDeletionNamespace,
} from "@/skj";

export async function initSkj() {
  const skjPortlet = takePortlet("wks-skj");
  if (!skjPortlet) {
    console.warn(`${SCRIPT_NAME}: メニューの作成に失敗しました。`);
    return;
  }

  skjPortlet.addEventListener("click", async (e) => {
    e.preventDefault();

    const targetPageName = String(mw.config.get("wgPageName"));
    const targetPageId = Number(mw.config.get("wgArticleId"));
    const isUserPageDeletion = isUserPageDeletionNamespace(
      Number(mw.config.get("wgNamespaceNumber")),
    );
    const redirectTargetPromise = isUserPageDeletion
      ? Promise.resolve(null)
      : fetchCurrentRedirectTarget(new mw.Api(), targetPageName);
    const targetPageContextPromise = getPageEditContext(targetPageName, true);
    const existRFDPagePromise = isUserPageDeletion
      ? Promise.resolve(null)
      : new mw.Api().post({
          action: "query",
          format: "json",
          titles: SKJ_REQUEST_PAGE_NAME + targetPageName,
          formatversion: "2",
        });
    const createRow = createRowFunc("skj");
    const dialogContent = $("<div>")
      .prop("id", "wks-skj-dialog-content")
      .text("読み込み中")
      .append(getImage("load", "margin-left: 0.5em;"));
    const skjDialog = await openDialog({
      title: `${SCRIPT_NAME} - ${isUserPageDeletion ? "利用者ページの削除依頼" : "削除依頼"}`,
      dialogClass: "wks-skj-dialog",
      content: dialogContent,
    });
    const [targetPageContext, existRFDPage, initialRedirectTarget] =
      await Promise.all([
        targetPageContextPromise,
        existRFDPagePromise,
        redirectTargetPromise,
      ]);
    if (
      targetPageContext.revisionId === null ||
      targetPageContext.content === null
    ) {
      dialogContent.empty().text("ページが存在しないため編集できません。");
      skjDialog.setButtons([
        { label: "閉じる", onClick: () => skjDialog.close() },
      ]);
      return;
    }
    const pageContent = targetPageContext.content;
    dialogContent.empty();
    const dialogFieldset = $("<fieldset>");
    dialogFieldset.prop("id", "wks-skj-dialog-optionfield");
    const dialogLegend = $("<legend>").text(
      `${isUserPageDeletion ? "利用者ページの削除依頼" : "削除依頼"}の提出`,
    );
    dialogFieldset.append(dialogLegend);
    dialogContent.append(dialogFieldset);

    const hasRedirectMode = initialRedirectTarget !== null;
    if (hasRedirectMode) {
      const dialogModeRow = createRow("mode").addClass("wks-inline");
      for (const mode of ["standard", "redirect"] as const) {
        const id = `wks-skj-dialog-mode-${mode}`;
        dialogModeRow.append(
          $("<input>").prop({
            id,
            name: "wks-skj-dialog-mode",
            type: "radio",
            value: mode,
            checked: mode === "standard",
          }),
          $("<label>")
            .prop("for", id)
            .text(
              mode === "standard" ? "通常の削除依頼" : "リダイレクトの削除依頼",
            ),
        );
      }
      dialogFieldset.append(dialogModeRow);
    }

    const getSelectedMode = (): "standard" | "redirect" =>
      hasRedirectMode &&
      $("input[name='wks-skj-dialog-mode']:checked").val() === "redirect"
        ? "redirect"
        : "standard";
    const isRedirectDeletion = () => getSelectedMode() === "redirect";
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
    const jstFormatter = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const jstParts = jstFormatter.formatToParts(new Date());
    const yyyymmdd =
      (jstParts.find((p) => p.type === "year")?.value || "") +
      (jstParts.find((p) => p.type === "month")?.value || "") +
      (jstParts.find((p) => p.type === "day")?.value || "");
    dialogPageNameDiv.append(
      $("<input>").prop({
        id: "wks-skj-dialog-page-name-input",
        type: "text",
        placeholder: "ページ名",
        style: "width: 100%;",
        value: existRFDPage?.query.pages[0].missing
          ? targetPageName
          : `${targetPageName} ${yyyymmdd}`,
      }),
    );
    if (existRFDPage && !existRFDPage.query.pages[0].missing) {
      mw.notify(
        "すでに削除依頼ページが存在していたので、サブページ名に日付を追加しました。",
      );
    }
    dialogPageNameRow.append(dialogPageNameDiv);
    if (!isUserPageDeletion) {
      dialogFieldset.append(dialogPageNameRow);
    }
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
        .text(
          isUserPageDeletion
            ? "利用者名を依頼見出しに表示せず、ページIDを使用する"
            : "ページ名を使用せず、ページIDを使用する (サブページ名に名称を入れないようにしてください！)",
        )
        .prop("for", "wks-skj-dialog-use-id-cb"),
    );
    dialogFieldset.append(dialogCRRow);
    dialogFieldset.append(dialogBlankRow);
    dialogFieldset.append(dialogUseIdRow);

    const dialogOptionsSeparator = $("<hr>").addClass("wks-hr");
    dialogFieldset.append(dialogOptionsSeparator);

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

    const dialogMarksSeparator = $("<hr>").addClass("wks-hr");
    dialogFieldset.append(dialogMarksSeparator);

    const dialogDescRow = createRow("desc");
    dialogDescRow.append(
      $("<label>").html("理由").prop("for", "wks-skj-dialog-desc-input"),
    );
    dialogDescRow.append(
      $("<textarea>").prop({
        id: "wks-skj-dialog-desc-input",
        placeholder: isUserPageDeletion
          ? "ケースB-2、プライバシー侵害のおそれ。～～～"
          : "ケースI-1、特筆性なし。〜〜〜",
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
    const summaryTemplateLabel = $("<label>")
      .text(`${isUserPageDeletion ? "Ufd" : "Sakujo"}貼り付け: `)
      .prop("for", "wks-skj-dialog-summary-template")
      .addClass("wks-shrink-0");
    summaryTemplate.append(summaryTemplateLabel);
    summaryTemplate.append(
      $("<input>").prop({
        id: "wks-skj-dialog-summary-template",
        type: "text",
        placeholder: isUserPageDeletion ? "+Ufd" : "+Sakujo",
        style: "width: 100%;",
        value: getOptionProperty(
          isUserPageDeletion
            ? "skj.default.summaryUfdTemplate"
            : "skj.default.summaryTemplate",
        ),
      }),
    );
    dialogSummaries.append(summaryTemplate);
    const summarySubmit = $("<div>").addClass("wks-inline");
    const summarySubmitLabel = $("<label>")
      .text(isUserPageDeletion ? "依頼ページへの追記: " : "依頼ページ作成: ")
      .prop("for", "wks-skj-dialog-summary-submit")
      .addClass("wks-shrink-0");
    summarySubmit.append(summarySubmitLabel);
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
    const summaryNote = $("<div>").addClass("wks-inline");
    summaryNote.append(
      $("<label>")
        .text("ログへの追記: ")
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
    summaryNote.toggle(!isUserPageDeletion);
    dialogFieldset.append(dialogSummaries);

    getOptionProperty("skj.opvPresets").forEach(
      (x: { name: string; value: string }, i: number) => {
        $(`#wks-skj-preset-id${i}`).on("click", () => {
          $("#wks-skj-dialog-opv-input").val(x.value);
        });
      },
    );

    const opvValues = {
      standard: String($("#wks-skj-dialog-opv-input").val() ?? ""),
      redirect: "（削除） 依頼者票。",
    };
    let previousMode = getSelectedMode();
    const updateModeFields = () => {
      const mode = getSelectedMode();
      opvValues[previousMode] = String(
        $("#wks-skj-dialog-opv-input").val() ?? "",
      );
      $("#wks-skj-dialog-opv-input").val(opvValues[mode]);
      previousMode = mode;

      const redirect = mode === "redirect";
      dialogLegend.text(
        `${redirect ? "リダイレクトの削除依頼" : isUserPageDeletion ? "利用者ページの削除依頼" : "削除依頼"}の提出`,
      );
      dialogPageNameRow.toggle(!redirect);
      dialogCRRow.toggle(!redirect);
      dialogBlankRow.toggle(!redirect);
      dialogUseIdRow.toggle(!redirect);
      dialogMarkRights.toggle(!redirect);
      dialogMarkEmer.toggle(!redirect);
      dialogMarkRev.toggle(!redirect);
      dialogOptionsSeparator.toggle(!redirect);
      dialogMarksSeparator.toggle(!redirect);
      preset.toggle(!redirect);
      summaryTemplate.toggle(!redirect);
      summaryNote.toggle(!isUserPageDeletion && !redirect);
      summarySubmitLabel.text(
        redirect
          ? "受付ページへの追記: "
          : isUserPageDeletion
            ? "依頼ページへの追記: "
            : "依頼ページ作成: ",
      );
      $("#wks-skj-dialog-summary-submit").prop(
        "placeholder",
        redirect ? "リダイレクトの削除依頼" : "削除依頼",
      );
      $("#wks-skj-dialog-desc-input").prop(
        "placeholder",
        redirect
          ? "リダイレクト削除の方針のどのケースに該当するかを含め、理由を入力してください。"
          : isUserPageDeletion
            ? "ケースB-2、プライバシー侵害のおそれ。～～～"
            : "ケースI-1、特筆性なし。〜〜〜",
      );
    };
    $("input[name='wks-skj-dialog-mode']").on("change", updateModeFields);
    updateModeFields();

    // 第一タプル: prependtext か text か (true なら text, false なら prependtext)
    // forceText を true にすると text になる
    const getFinalContentPrepend = (forceText = false) =>
      [
        forceText || $("#wks-skj-dialog-blank-cb").prop("checked"),
        `${
          mw.config.get("wgNamespaceNumber") === 10 ? "<noinclude>" : ""
        }{{subst:${
          isUserPageDeletion
            ? "ufd"
            : `Sakujo${
                $("#wks-skj-dialog-page-name-input").val() === targetPageName
                  ? ""
                  : `|${$("#wks-skj-dialog-page-name-input").val()}`
              }`
        }}}${
          $("#wks-skj-dialog-cr-cb").prop("checked")
            ? `\n{{Copyrights${
                $("#wks-skj-dialog-blank-cb").prop("checked") ? "|白紙化=1" : ""
              }}}`
            : ""
        }${mw.config.get("wgNamespaceNumber") === 10 ? "</noinclude>" : "\n"}${
          !$("#wks-skj-dialog-blank-cb").prop("checked") && forceText
            ? pageContent
            : ""
        }`,
      ] as const;

    const getFinalContentRequest = () => {
      const reasonRaw = String($("#wks-skj-dialog-desc-input").val() ?? "");
      if (isRedirectDeletion()) {
        if (!initialRedirectTarget) {
          throw new Error("現在の転送先を取得できません。");
        }
        return getRedirectDeletionRequestText(
          targetPageName,
          initialRedirectTarget,
          reasonRaw,
          String($("#wks-skj-dialog-opv-input").val() ?? ""),
        );
      }
      const signReason = getOptionProperty("skj.signReason") === true;
      const reasonField = getDeletionRequestReason(reasonRaw, signReason);
      if (isUserPageDeletion) {
        return getUserPageDeletionRequestText(
          reasonField,
          String($("#wks-skj-dialog-opv-input").val() ?? ""),
        );
      }
      return `{{subst:新規削除依頼サブページ
|ページ名=${$("#wks-skj-dialog-use-id-cb").prop("checked") ? "" : targetPageName}
|ID=${$("#wks-skj-dialog-use-id-cb").prop("checked") ? targetPageId : ""}
|特記号=${$("#wks-skj-dialog-mark-rights-cb").prop("checked") ? "*" : ""}${$("#wks-skj-dialog-mark-emer-cb").prop("checked") ? "緊" : ""}${$("#wks-skj-dialog-mark-rev-cb").prop("checked") ? "特" : ""}
|理由=${reasonField}
|依頼者票=${$("#wks-skj-dialog-opv-input").val()} --~~~~
}}`;
    };

    const checkParams = () => {
      const errList = $("<ul>");

      if (
        !isUserPageDeletion &&
        !isRedirectDeletion() &&
        !$("#wks-skj-dialog-page-name-input").val()
      ) {
        errList.append($("<li>").text("ページ名を入力してください。"));
      }

      if (!$("#wks-skj-dialog-desc-input").val()) {
        errList.append($("<li>").text("理由を入力してください。"));
      }

      if (!$("#wks-skj-dialog-opv-input").val()) {
        errList.append($("<li>").text("依頼者票を入力してください。"));
      }

      const privacyWarnings = isRedirectDeletion()
        ? []
        : getPageIdPrivacyWarnings({
            usePageId: Boolean($("#wks-skj-dialog-use-id-cb").prop("checked")),
            requestPageName: isUserPageDeletion
              ? UFD_REQUEST_PAGE_NAME
              : String($("#wks-skj-dialog-page-name-input").val() ?? ""),
            targetPageName,
            summaries: [
              {
                label: `${isUserPageDeletion ? "Ufd" : "Sakujo"}貼り付け`,
                value: String(
                  $("#wks-skj-dialog-summary-template").val() ?? "",
                ),
              },
              {
                label: isUserPageDeletion
                  ? "依頼ページへの追記"
                  : "依頼ページ作成",
                value: String($("#wks-skj-dialog-summary-submit").val() ?? ""),
              },
              ...(isUserPageDeletion
                ? []
                : [
                    {
                      label: "ログへの追記",
                      value: String(
                        $("#wks-skj-dialog-summary-note").val() ?? "",
                      ),
                    },
                  ]),
            ],
          });
      for (const warning of privacyWarnings) {
        errList.append($("<li>").text(warning));
      }

      if (errList.children().length) {
        return $("<div>")
          .append($("<p>").text("入力にエラーがあります。"))
          .append(errList);
      } else {
        return true;
      }
    };

    const getUserPageReference = () =>
      getUserPageDeletionReference(
        targetPageName,
        targetPageId,
        Boolean($("#wks-skj-dialog-use-id-cb").prop("checked")),
      );

    const getUserPageSectionTitle = () =>
      getUserPageDeletionSectionTitle(getUserPageReference(), {
        rights: Boolean($("#wks-skj-dialog-mark-rights-cb").prop("checked")),
        emergency: Boolean($("#wks-skj-dialog-mark-emer-cb").prop("checked")),
        revision: Boolean($("#wks-skj-dialog-mark-rev-cb").prop("checked")),
      });

    const executeUserPageDeletion = async () => {
      const progressContentHolder = $("<div>").css({
        maxHeight: "70vh",
        maxWidth: "80vw",
      });
      const progressDialog = await openDialog({
        title: `${SCRIPT_NAME} - 利用者ページの削除依頼`,
        dialogClass: "wks-mi-dialog wks-mi-dialog-preview",
        content: progressContentHolder,
      });
      const wipMessage = $("<p>")
        .addClass("wks-red")
        .css("font-weight", "bold")
        .text("注意: 削除依頼中はタブを閉じないでください！");
      progressContentHolder.append(wipMessage);

      const unloadFunc = (event: BeforeUnloadEvent) => {
        event.returnValue = "During the user page deletion request progress!";
      };
      addEventListener("beforeunload", unloadFunc);
      const finish = () => {
        removeEventListener("beforeunload", unloadFunc);
        progressDialog.setButtons([
          { label: "閉じる", onClick: () => progressDialog.close() },
        ]);
      };
      const addProgress = (id: string, message: string) =>
        $("<div>")
          .prop("id", id)
          .addClass("wks-inline")
          .append(getImage("load", ""))
          .append($("<span>").text(message))
          .appendTo(progressContentHolder);
      const setProgress = (
        element: JQuery,
        icon: "check" | "cross",
        message: string,
      ) => {
        element
          .empty()
          .append(getImage(icon, ""))
          .append($("<span>").text(message));
      };

      const duplicateCheck = addProgress(
        "wks-dialog-progress-content-check-exists",
        "既存依頼の確認中",
      );
      let requestPageContext;
      try {
        requestPageContext = await getPageEditContext(
          UFD_REQUEST_PAGE_NAME,
          true,
        );
        if (
          requestPageContext.revisionId === null ||
          requestPageContext.content === null
        ) {
          throw new Error(`${UFD_REQUEST_PAGE_NAME}が存在しません。`);
        }
        if (
          hasUserPageDeletionRequest(
            requestPageContext.content,
            getUserPageReference(),
          )
        ) {
          setProgress(
            duplicateCheck,
            "cross",
            "同じ対象の削除依頼がすでに存在します。",
          );
          finish();
          return;
        }
        setProgress(duplicateCheck, "check", "既存の削除依頼はありません。");
      } catch (error) {
        setProgress(
          duplicateCheck,
          "cross",
          `既存依頼の確認に失敗しました。(${String(error)})`,
        );
        finish();
        return;
      }

      const templateProgress = addProgress(
        "wks-dialog-progress-content-prepend-tl",
        "Ufdテンプレートの貼付中",
      );
      try {
        const [isText, text] = getFinalContentPrepend();
        const result = await new mw.Api().postWithEditToken({
          action: "edit",
          title: targetPageName,
          nocreate: 1,
          text: isText ? text : undefined,
          prependtext: isText ? undefined : text,
          summary:
            (($("#wks-skj-dialog-summary-template").val() as string) || "+Ufd")
              .replaceAll("$d", UFD_REQUEST_PAGE_NAME)
              .replaceAll("$p", targetPageName) + SUMMARY_AD,
          formatversion: "2",
          baserevid: targetPageContext.revisionId,
          starttimestamp: targetPageContext.startTimestamp,
          notminor: 1,
        });
        if (result.edit.result !== "Success") {
          throw new Error("Conflict?");
        }
        setProgress(
          templateProgress,
          "check",
          "Ufdテンプレートを貼り付けました。",
        );
      } catch (error) {
        setProgress(
          templateProgress,
          "cross",
          `Ufdテンプレートの貼付に失敗しました。(${String(error)})`,
        );
        finish();
        return;
      }

      const requestProgress = addProgress(
        "wks-dialog-progress-content-submit",
        "利用者ページの削除依頼へ追記中",
      );
      try {
        requestPageContext = await getPageEditContext(
          UFD_REQUEST_PAGE_NAME,
          true,
        );
        if (
          requestPageContext.revisionId === null ||
          requestPageContext.content === null
        ) {
          throw new Error(`${UFD_REQUEST_PAGE_NAME}が存在しません。`);
        }
        if (
          hasUserPageDeletionRequest(
            requestPageContext.content,
            getUserPageReference(),
          )
        ) {
          throw new Error("同じ対象の削除依頼がすでに存在します。");
        }
        const result = await new mw.Api().postWithEditToken({
          action: "edit",
          title: UFD_REQUEST_PAGE_NAME,
          nocreate: 1,
          appendtext: `\n\n${getUserPageDeletionRequestSection(
            getUserPageSectionTitle(),
            getFinalContentRequest(),
          )}`,
          summary:
            (
              ($("#wks-skj-dialog-summary-submit").val() as string) ||
              "削除依頼"
            )
              .replaceAll("$d", UFD_REQUEST_PAGE_NAME)
              .replaceAll("$p", targetPageName) + SUMMARY_AD,
          formatversion: "2",
          baserevid: requestPageContext.revisionId,
          starttimestamp: requestPageContext.startTimestamp,
          notminor: 1,
        });
        if (result.edit.result !== "Success") {
          throw new Error("Conflict?");
        }
        setProgress(
          requestProgress,
          "check",
          "利用者ページの削除依頼へ追記しました。",
        );
      } catch (error) {
        setProgress(
          requestProgress,
          "cross",
          `依頼ページへの追記に失敗しました。対象ページにはUfdテンプレートが貼付済みです。(${String(error)})`,
        );
        finish();
        return;
      }

      finish();
    };

    const executeRedirectDeletion = async () => {
      const progressContentHolder = $("<div>").css({
        maxHeight: "70vh",
        maxWidth: "80vw",
      });
      const progressDialog = await openDialog({
        title: `${SCRIPT_NAME} - リダイレクトの削除依頼`,
        dialogClass: "wks-mi-dialog wks-mi-dialog-preview",
        content: progressContentHolder,
      });
      const wipMessage = $("<p>")
        .addClass("wks-red")
        .css("font-weight", "bold")
        .text("注意: 削除依頼中はタブを閉じないでください！");
      const progress = $("<div>")
        .addClass("wks-inline")
        .append(getImage("load", ""), $("<span>").text("現在の状態を確認中"));
      progressContentHolder.append(wipMessage, progress);
      progressDialog.reposition();

      const unloadFunc = (event: BeforeUnloadEvent) => {
        event.returnValue = "During the redirect deletion request!";
      };
      addEventListener("beforeunload", unloadFunc);
      const finish = () => {
        removeEventListener("beforeunload", unloadFunc);
        progressDialog.setButtons([
          { label: "閉じる", onClick: () => progressDialog.close() },
        ]);
      };

      try {
        const currentRedirectTarget = await fetchCurrentRedirectTarget(
          new mw.Api(),
          targetPageName,
        );
        if (!currentRedirectTarget) {
          throw new Error(
            "ダイアログを開いた後に対象ページがリダイレクトではなくなりました。",
          );
        }
        if (currentRedirectTarget !== initialRedirectTarget) {
          throw new Error(
            "ダイアログを開いた後に転送先が変更されました。内容を確認してやり直してください。",
          );
        }

        const requestPageContext = await getPageEditContext(
          RFD_REQUEST_PAGE_NAME,
          true,
        );
        if (
          requestPageContext.revisionId === null ||
          requestPageContext.content === null
        ) {
          throw new Error(`${RFD_REQUEST_PAGE_NAME}が存在しません。`);
        }
        if (
          hasRedirectDeletionRequest(requestPageContext.content, targetPageName)
        ) {
          throw new Error("同じ対象の削除依頼がすでに存在します。");
        }

        const sectionHeading = getRedirectDeletionRequestSectionHeading(
          new Date(requestPageContext.startTimestamp),
        );
        const updatedContent = appendRedirectDeletionRequest(
          requestPageContext.content,
          sectionHeading,
          getFinalContentRequest(),
        );
        progress
          .empty()
          .append(getImage("load", ""), $("<span>").text("受付ページへ追記中"));
        const result = await new mw.Api().postWithEditToken({
          action: "edit",
          title: RFD_REQUEST_PAGE_NAME,
          nocreate: 1,
          text: updatedContent,
          summary:
            (
              String($("#wks-skj-dialog-summary-submit").val() ?? "") ||
              "リダイレクトの削除依頼"
            )
              .replaceAll("$d", RFD_REQUEST_PAGE_NAME)
              .replaceAll("$p", targetPageName) + SUMMARY_AD,
          formatversion: "2",
          baserevid: requestPageContext.revisionId,
          starttimestamp: requestPageContext.startTimestamp,
          notminor: 1,
        });
        if (result.edit.result !== "Success") {
          throw new Error("Conflict?");
        }
        progress.empty().append(
          getImage("check", ""),
          $("<span>").append(
            "リダイレクトの削除依頼へ追記しました。(",
            $("<a>")
              .prop({
                href: mw.util.getUrl(RFD_REQUEST_PAGE_NAME),
                target: "_blank",
              })
              .text("リンク"),
            ")",
          ),
        );
      } catch (error) {
        progress
          .empty()
          .append(
            getImage("cross", ""),
            $("<span>").text(`依頼の提出に失敗しました。(${String(error)})`),
          );
      } finally {
        finish();
      }
    };

    const execute = async () => {
      const err = checkParams();
      if (err !== true) {
        mw.notify(err, { type: "error" });
        return;
      }

      if (isRedirectDeletion()) {
        await executeRedirectDeletion();
        return;
      }

      if (isUserPageDeletion) {
        await executeUserPageDeletion();
        return;
      }

      const progressContentHolder = $("<div>").css({
        maxHeight: "70vh",
        maxWidth: "80vw",
      });
      const progressDialog = await openDialog({
        title: `${SCRIPT_NAME} - 削除依頼`,
        dialogClass: "wks-mi-dialog wks-mi-dialog-preview",
        content: progressContentHolder,
      });

      progressDialog.reposition();

      const wipMessage = $("<p>")
        .addClass("wks-red")
        .css("font-weight", "bold")
        .text("注意: 削除依頼中はタブを閉じないでください！");
      progressContentHolder.append(wipMessage);

      const unloadFunc = (e: BeforeUnloadEvent) => {
        e.returnValue = "During the Sakujo progress!";
      };
      addEventListener("beforeunload", unloadFunc);

      const progressDialogContentCheckExists = $("<div>")
        .prop("id", "wks-dialog-progress-content-check-exists")
        .addClass("wks-inline")
        .append(getImage("load", ""))
        .append($("<span>").text("ページの存在チェック中"));
      progressContentHolder.append(progressDialogContentCheckExists);

      const getPageName = () =>
        SKJ_REQUEST_PAGE_NAME + $("#wks-skj-dialog-page-name-input").val();
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
        progressDialog.setButtons([
          {
            label: "閉じる",
            onClick: () => progressDialog.close(),
          },
        ]);
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
      progressContentHolder.append(progressDialogContentPrependTl);

      try {
        const [isText, t] = getFinalContentPrepend();
        const prependRes = await new mw.Api().postWithEditToken({
          action: "edit",
          title: targetPageName,
          nocreate: 1,
          text: isText ? t : undefined,
          prependtext: isText ? undefined : t,
          summary:
            (
              ($("#wks-skj-dialog-summary-template").val() as string) ||
              "+Sakujo"
            )
              .replaceAll("$d", getPageName())
              .replaceAll("$p", targetPageName) + SUMMARY_AD,
          formatversion: "2",
          baserevid: targetPageContext.revisionId,
          starttimestamp: targetPageContext.startTimestamp,
          notminor: 1,
        });

        if (prependRes.edit.result !== "Success") {
          progressDialogContentPrependTl.empty();
          progressDialogContentPrependTl.append(getImage("cross", ""));
          progressDialogContentPrependTl.append(
            $("<span>").html(`テンプレートの貼付に失敗しました。(Conflict?)`),
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

        progressContentHolder.append(progressDialogContentWait1);

        await sleep(5000);

        progressDialogContentWait1.empty();
        progressDialogContentWait1.append(getImage("check", ""));
        progressDialogContentWait1.append($("<span>").html(`5秒待機します...`));

        const progressDialogContentSubmit = $("<div>")
          .prop("id", "wks-dialog-progress-content-submit")
          .addClass("wks-inline")
          .append(getImage("load", ""))
          .append($("<span>").text("依頼ページの作成中"));

        progressContentHolder.append(progressDialogContentSubmit);

        try {
          const submitRes = await new mw.Api().postWithEditToken({
            action: "edit",
            title: getPageName(),
            createonly: 1,
            text: getFinalContentRequest(),
            summary:
              (
                ($("#wks-skj-dialog-summary-submit").val() as string) ||
                "削除依頼"
              )
                .replaceAll("$d", getPageName())
                .replaceAll("$p", mw.config.get("wgPageName")) + SUMMARY_AD,
            formatversion: "2",
            starttimestamp: targetPageContext.startTimestamp,
          });

          if (submitRes.edit.result !== "Success") {
            progressDialogContentSubmit.empty();
            progressDialogContentSubmit.append(getImage("cross", ""));
            progressDialogContentSubmit.append(
              $("<span>").html(`依頼ページの作成に失敗しました。(Conflict?)`),
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

          progressContentHolder.append(progressDialogContentWait2);

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

          progressContentHolder.append(progressDialogContentNote);

          const logPageName =
            SKJ_REQUEST_PAGE_NAME +
            `ログ/${new Date().getFullYear()}年${new Date().getMonth() + 1}月${new Date().getDate()}日`;

          try {
            const logPageContext = await getPageEditContext(logPageName, true);
            if (
              logPageContext.revisionId === null ||
              logPageContext.content === null
            ) {
              throw new Error("削除依頼ログが存在しません。");
            }
            const logPageContent = logPageContext.content.replace(
              /(\r\n|\n)+$/,
              "",
            );

            const logPageEditRes = await new mw.Api().postWithEditToken({
              action: "edit",
              title: logPageName,
              nocreate: 1,
              text: `${logPageContent}\n{{${getPageName()}}}`,
              summary:
                (
                  ($("#wks-skj-dialog-summary-note").val() as string) ||
                  "削除依頼の追加"
                )
                  .replaceAll("$d", getPageName())
                  .replaceAll("$p", mw.config.get("wgPageName")) + SUMMARY_AD,
              formatversion: "2",
              baserevid: logPageContext.revisionId,
              starttimestamp: logPageContext.startTimestamp,
            });

            if (logPageEditRes.edit.result !== "Success") {
              progressDialogContentNote.empty();
              progressDialogContentNote.append(getImage("cross", ""));
              progressDialogContentNote.append(
                $("<span>").html(`ログへの追記に失敗しました。(Conflict?)`),
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
            progressDialog.setButtons([
              {
                label: "閉じる",
                onClick: () => progressDialog.close(),
              },
            ]);

            removeEventListener("beforeunload", unloadFunc);
            return;
          }
        } catch (e) {
          progressDialogContentSubmit.empty();
          progressDialogContentSubmit.append(getImage("cross", ""));
          progressDialogContentSubmit.append(
            $("<span>").html(`依頼ページの作成に失敗しました。(${e})`),
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
      } catch (e) {
        progressDialogContentPrependTl.empty();
        progressDialogContentPrependTl.append(getImage("cross", ""));
        progressDialogContentPrependTl.append(
          $("<span>").html(`テンプレートの貼付に失敗しました。(${e})`),
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
      const err = checkParams();
      if (err !== true) {
        mw.notify(err, { type: "error" });
        return;
      }
      if (isRedirectDeletion()) {
        const previewContent = $("<div>")
          .text("読み込み中")
          .append(getImage("load", "margin-left: 0.5em;"));
        const previewDialog = await openDialog({
          title: `${SCRIPT_NAME} - リダイレクトの削除依頼プレビュー`,
          dialogClass: "wks-skj-dialog wks-skj-dialog-preview",
          content: previewContent,
        });
        try {
          const summary =
            (
              String($("#wks-skj-dialog-summary-submit").val() ?? "") ||
              "リダイレクトの削除依頼"
            )
              .replaceAll("$d", RFD_REQUEST_PAGE_NAME)
              .replaceAll("$p", targetPageName) + SUMMARY_AD;
          const parseResult = await new mw.Api().post({
            action: "parse",
            title: RFD_REQUEST_PAGE_NAME,
            text: getFinalContentRequest(),
            summary,
            prop: "text|modules|jsconfigvars",
            pst: true,
            disablelimitreport: true,
            disableeditsection: true,
            disabletoc: true,
            contentmodel: "wikitext",
            formatversion: "2",
          });
          if (parseResult.parse.modules.length) {
            mw.loader.load(parseResult.parse.modules);
          }
          if (parseResult.parse.modulestyles.length) {
            mw.loader.load(parseResult.parse.modulestyles);
          }
          previewContent.empty().append(
            $("<div>")
              .html("編集の要約: " + parseResult.parse.parsedsummary)
              .prop("id", "wks-skj-dialog-preview-summary"),
            $("<hr>").addClass("wks-hr"),
            $("<div>")
              .html(parseResult.parse.text)
              .addClass("wks-dialog-preview-div"),
          );
        } catch (error) {
          previewContent
            .empty()
            .text(`プレビューの取得に失敗しました。(${String(error)})`);
        }
        previewDialog.reposition();
        return;
      }
      const pageName = isUserPageDeletion
        ? UFD_REQUEST_PAGE_NAME
        : SKJ_REQUEST_PAGE_NAME + $("#wks-skj-dialog-page-name-input").val();
      const previewContentHolder = $("<div>").css({
        maxHeight: "70vh",
        maxWidth: "80vw",
      });
      const previewDialog = await openDialog({
        title: `${SCRIPT_NAME} - ${isUserPageDeletion ? "利用者ページの削除依頼" : "削除依頼"}プレビュー`,
        dialogClass: "wks-skj-dialog wks-skj-dialog-preview",
        content: previewContentHolder,
      });
      const previewContent = $("<div>")
        .prop("id", "wks-dialog-preview-content")
        .text("読み込み中")
        .append(getImage("load", "margin-left: 0.5em;"));
      const previewContent2 = $("<div>")
        .prop("id", "wks-dialog-preview-content2")
        .text("読み込み中")
        .append(getImage("load", "margin-left: 0.5em;"));
      previewContentHolder.append(previewContent);
      previewContentHolder.append($("<hr>").addClass("wks-hr"));
      previewContentHolder.append(previewContent2);
      const [parseRes, parseRes2] = await Promise.all([
        new mw.Api().post({
          action: "parse",
          title: targetPageName,
          text: getFinalContentPrepend(true)[1],
          summary:
            (
              ($("#wks-skj-dialog-summary-template").val() as string) ||
              (isUserPageDeletion ? "+Ufd" : "+Sakujo")
            )
              .replaceAll("$d", pageName)
              .replaceAll("$p", targetPageName) + SUMMARY_AD,
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
          title: pageName,
          text: isUserPageDeletion
            ? getUserPageDeletionRequestSection(
                getUserPageSectionTitle(),
                getFinalContentRequest(),
              )
            : getFinalContentRequest(),
          summary:
            (
              ($("#wks-skj-dialog-summary-submit").val() as string) ||
              "削除依頼"
            )
              .replaceAll("$d", pageName)
              .replaceAll("$p", targetPageName) + SUMMARY_AD,
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
            (isUserPageDeletion
              ? ""
              : "<br>注意: これはプレビューであり、依頼ページはまだ作成されていないと表示されることに留意してください。"),
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

      previewDialog.reposition();
    };

    skjDialog.setButtons([
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
        onClick: () => skjDialog.close(),
      },
    ]);

    skjDialog.reposition();
  });
}
