import { showConfigPage } from "./preferences";

mw.hook("wkspinner.page.preferences").fire({ init: showConfigPage });
