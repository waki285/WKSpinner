import cmp from "semver-compare";

type MigratableOptions = {
  rfp?: { default?: { summarySubmit?: string } };
  warn?: { default?: { summary?: string } };
  mi?: { default?: { summary?: string } };
};

export function applyOptionMigrations(
  settings: MigratableOptions,
  lastVersion: string,
): boolean {
  let changed = false;

  if (
    cmp(lastVersion, "0.10.6") === -1 &&
    settings.rfp?.default?.summarySubmit === "保護依頼"
  ) {
    settings.rfp.default.summarySubmit = "+$p";
    changed = true;
  }

  if (
    cmp(lastVersion, "0.10.10") === -1 &&
    settings.warn?.default?.summary === "$t"
  ) {
    settings.warn.default.summary = "+{{$t}}";
    changed = true;
  }

  if (
    cmp(lastVersion, "0.11.1") === -1 &&
    settings.mi?.default?.summary === "+$t"
  ) {
    settings.mi.default.summary = "+{{$t}}";
    changed = true;
  }

  return changed;
}
