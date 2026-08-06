import { initWarn } from "./warn";

mw.hook("wkspinner.module.warn").fire({ init: initWarn });
