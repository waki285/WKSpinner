import { initWikidata } from "./wikidata";

mw.hook("wkspinner.module.wikidata").fire({ init: initWikidata });
