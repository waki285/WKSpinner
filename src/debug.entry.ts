import { showDebugPage } from "./debug";

mw.hook("wkspinner.page.debug").fire({ init: showDebugPage });
