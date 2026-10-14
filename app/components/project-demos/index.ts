import { slugify } from "../../editor/types";
import type { Demo } from "./stage";
import { coffeeClub } from "./coffee-club";
import { gideon } from "./gideon";
import { harsukh } from "./harsukh";
import { leadTruthEngine } from "./lead-truth-engine";
import { milo } from "./milo";
import { sayings } from "./sayings";
import { taskhive } from "./taskhive";
import { tracecli } from "./tracecli";
import { wikiAsterisk } from "./wiki-asterisk";

export { DemoStage, type Demo } from "./stage";

/* Keyed by the slug of the project's name, so the same lookup works for
   the static data, Supabase rows and editor-managed entries alike.
   Renaming a project means renaming its key here. */
const demos: Record<string, Demo> = {
  "coffee-club": coffeeClub,
  gideon,
  "harsukh-residences": harsukh,
  "lead-truth-engine": leadTruthEngine,
  milo,
  sayings,
  taskhive,
  tracecli,
  wikiasterisk: wikiAsterisk,
};

export function demoFor(name: string): Demo | undefined {
  return demos[slugify(name)];
}
