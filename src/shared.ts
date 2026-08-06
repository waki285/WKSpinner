/**
 * Registers shared modules (util, dialog, skj-validation) on globalThis so
 * that lazily-loaded module bundles can access them without re-bundling the
 * same code.  constants.ts and issue-templates.ts are intentionally NOT
 * shared here: constants is pure data and esbuild tree-shakes each entry's
 * imports down to only the constants that entry uses; issue-templates is
 * only consumed by the mi module, so keeping it in shared would bloat the
 * core bundle unnecessarily.
 */
import * as _util from "./util";
import * as _dialog from "./dialog";
import * as _skjValidation from "./skj-validation";

const SHARED_KEY = Symbol.for("wkspinner.shared");

(globalThis as Record<symbol, unknown>)[SHARED_KEY] = Object.freeze({
  util: _util,
  dialog: _dialog,
  skjValidation: _skjValidation,
});
