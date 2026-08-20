import { showWatchlistUsersPage } from "./watchlist-users";

mw.hook("wkspinner.page.watchlistUsers").fire({
  init: showWatchlistUsersPage,
});
