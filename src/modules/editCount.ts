// Thanks: MarkAdmins

import { REDLINK_REGEX } from "@/constants";

let processed = false;

const savedCounts = new Map<string, number>();

function appendEditCount(content: JQuery<HTMLElement>) {
  if (!processed) content = mw.util.$content || content;
  if (!content[0]) return;

  const rawAnchors = content[0].getElementsByTagName("a");
  const anchors: HTMLAnchorElement[] = Array.prototype.slice.call(rawAnchors);
  processed = true;

  const isUserpage = [2, 3].includes(mw.config.get("wgNamespaceNumber"));

  const users = new Set<string>();

  for (const a of anchors) {
    if (a.role === "button") continue;

    if (a.children[0]?.nodeName === "IMG") continue;

    if (a.parentElement?.classList?.contains("autocomment")) continue;

    let href = a.getAttribute("href");
    
    if (!href) {
      if (isUserpage && a.classList.contains("mw-selflink")) {
        href = "/wiki/" + mw.config.get("wgPageName");
      } else {
        continue;
      }
    }
    const isRedlink = href.includes("redlink=1");
    if (isRedlink) {
      href = `/wiki/${REDLINK_REGEX.exec(href)?.[1] as string}`;
    }


    if (!href) continue;

    href = decodeURIComponent(href);

    const isUser = href.startsWith("/wiki/User:") || href.startsWith("/wiki/利用者:");

    if (!isUser) continue;

    const username = /\/wiki\/(User|利用者):(.+)$/.exec(href)?.[2] as string;

    if (!username) continue;

    if (mw.util.isIPAddress(username)) continue;

    if (savedCounts.has(username)) {
      const editCount = savedCounts.get(username) as number;
      if (!a.children[1]?.classList.contains("wks-editcount")) {
        const span = document.createElement("span");
        span.classList.add("wks-editcount");
        span.textContent = `(${editCount})`;
        a.append(span);
      }
      continue;
    }

    users.add(username);
  }

  if (!users.size) return;

  const promises = [];

  const api = new mw.Api();

  // 50個ずつに分割
  const usersArray = [...users];
  const usersArrays = [];

  while (usersArray.length) {
    usersArrays.push(usersArray.splice(0, 50));
  }

  for (const users of usersArrays) {
    promises.push(
      api.get({
        action: "query",
        list: "users",
        ususers: [...users].join("|"),
        usprop: "editcount",
      }),
    );
  }

  Promise.all(promises).then((datas) => {
    const data = datas.reduce((prev, current) => {
      prev.query.users.push(...current.query.users);
      return prev;
    });

    const users = data.query.users;

    for (const a of anchors) {
      let href = a.getAttribute("href");
      
      if (!href) continue;

      href = decodeURIComponent(href);

      const isRedlink = href.includes("redlink=1");
      if (isRedlink) {
        href = `/wiki/${REDLINK_REGEX.exec(href)?.[1] as string}`;
      }

      const isUser = href.startsWith("/wiki/User:") || href.startsWith("/wiki/利用者:");
      if (!isUser) continue;
      
      const username = /\/wiki\/(User|利用者):(.+)$/.exec(href)?.[2] as string;

      if (!username) continue;
      
      if (mw.util.isIPAddress(username)) continue;

      const user = users.find((u: { name?: string }) => u.name === username.replace(/_/g, " "));

      if (!user) continue;
      
      const editCount = user.editcount;

      if (typeof editCount !== "number") continue;

      console.log(editCount);

      savedCounts.set(username, editCount);

      const span = document.createElement("span");
      span.classList.add("wks-editcount");
      span.textContent = `(${editCount})`;
      a.append(span);
    }
  });
}

export function initEditCount() {
  mw.hook("wikipage.content").add(function ($content) {
    appendEditCount($content);
  });
  //appendEditCount(mw.util.$content);
}
