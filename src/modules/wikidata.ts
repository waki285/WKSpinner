import { SCRIPT_NAME } from "../constants";

const WIKIDATA_API_URL = "https://www.wikidata.org/w/api.php";
const DESCRIPTION_ID = "wks-wikidata-description";

type WikidataResponse = {
  entities?: Record<
    string,
    {
      descriptions?: Record<string, { language: string; value: string }>;
    }
  >;
};

export function getJapaneseDescription(
  response: WikidataResponse,
  itemId: string,
): string | null {
  const description = response.entities?.[itemId]?.descriptions?.ja?.value;
  return description?.trim() || null;
}

function renderWikidataLabel(text: string, href: string, title: string) {
  const heading = document.getElementById("firstHeading");
  if (!heading || document.getElementById(DESCRIPTION_ID)) {
    return;
  }

  const container = document.createElement("div");
  container.id = DESCRIPTION_ID;
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.fontSize = "small";
  container.style.fontWeight = "normal";
  container.style.lineHeight = "1.3";
  container.style.textAlign = "center";

  const link = document.createElement("a");
  link.href = href;
  link.textContent = text;
  link.title = title;
  link.style.color = "var(--color-subtle, gray)";
  link.style.display = "inline-block";
  container.append(link);

  heading.style.display = "flex";
  heading.style.alignItems = "center";
  heading.style.gap = "1rem";
  heading.append(container);
}

export async function initWikidata() {
  const itemId = String(mw.config.get("wgWikibaseItemId") ?? "");
  const pageTitle = String(mw.config.get("wgTitle") ?? "");

  if (!/^Q\d+$/.test(itemId)) {
    renderWikidataLabel(
      "ウィキデータ未連携",
      `https://www.wikidata.org/wiki/Special:Search?search=${encodeURIComponent(pageTitle)}`,
      `ウィキデータ (未連携)`,
    );
    return;
  }

  if (document.getElementById(DESCRIPTION_ID)) {
    return;
  }

  try {
    await mw.loader.using("mediawiki.ForeignApi");
    const response = (await new mw.ForeignApi(WIKIDATA_API_URL, {
      anonymous: true,
    }).get({
      action: "wbgetentities",
      ids: itemId,
      props: "descriptions",
      languages: "ja",
      format: "json",
      formatversion: "2",
    })) as WikidataResponse;
    const description = getJapaneseDescription(response, itemId);
    if (!description) {
      renderWikidataLabel(
        "ウィキデータ説明文なし",
        `https://www.wikidata.org/wiki/${itemId}`,
        `ウィキデータ (${itemId})`,
      );
      return;
    }

    renderWikidataLabel(
      description,
      `https://www.wikidata.org/wiki/${itemId}`,
      `ウィキデータ (${itemId})`,
    );
  } catch (error) {
    console.warn(
      `${SCRIPT_NAME}: ウィキデータの日本語説明を取得できませんでした。`,
      error,
    );
  }
}
