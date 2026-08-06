import { initEditCount } from "./editCount";

mw.hook("wkspinner.module.editCount").fire({ init: initEditCount });
