import assert from "node:assert/strict";
import { build } from "esbuild";

const bundled = await build({
  entryPoints: ["app/agent/prompt.server.ts"],
  absWorkingDir: process.cwd(),
  bundle: true,
  format: "esm",
  loader: { ".md": "text" },
  platform: "node",
  target: "node22",
  write: false,
});

const source = bundled.outputFiles[0]?.text;
assert.ok(source, "The conversation prompt bundle was empty.");

const promptModule = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

const { buildConversationPrompt, selectConversationTopic } = promptModule;

const message = (content) => [{ role: "user", content }];
const topicCases = [
  ["hi", "small-talk"],
  ["What are you building right now?", "current-work"],
  ["What's Oriexa?", "projects"],
  ["Show me the 1 ms moment.", "technical-fit"],
  ["What did you do at REMAP AI?", "experience"],
  ["How do you handle JWT security?", "technical-fit"],
  ["How can I reach you?", "contact"],
  ["Where did you study?", "education"],
  ["Tell me about yourself.", "general"],
  ["What music do you listen to?", "personal"],
  ["Do you have any hobbies?", "personal"],
  ["What do you do outside of work?", "personal"],
  ["Do you read much?", "personal"],
  // The weak personal words must lose to a technical sentence, or a question
  // about the parts platform would be answered with only the hobby notes.
  ["How does the parts database read millions of records?", "technical-fit"],
  // A named project must beat the contact keywords, or the turn arrives with
  // only the contact block and the project gets invented from its name.
  ["Tell me about Oriexa and how I can reach you.", "projects"],
  ["Where did you work before Summon, and how do I email you?", "experience"],
  ["Do you play chess?", "personal"],
  ["What's your chess.com rating?", "personal"],
  ["What's your favourite book?", "personal"],
  ["Have you read the Rosie Project?", "personal"],
];

for (const [question, expectedTopic] of topicCases) {
  assert.equal(
    selectConversationTopic(message(question)).topic,
    expectedTopic,
    `Expected “${question}” to select ${expectedTopic}.`
  );
}

assert.equal(
  selectConversationTopic([
    { role: "user", content: "What are you building right now?" },
    { role: "assistant", content: "A short answer." },
    { role: "user", content: "Tell me more." },
  ]).topic,
  "current-work",
  "A short follow-up should retain the recent subject."
);

const currentPrompt = buildConversationPrompt(message("What are you building right now?"));
assert.match(currentPrompt, /# Current work skill/);
assert.match(currentPrompt, /# Bounded autonomy and connections/);
assert.match(currentPrompt, /Messages bridge/);
assert.match(currentPrompt, /Do not use em dashes or en dashes/);
assert.match(currentPrompt, /## Work: Summon Electronics/);
assert.doesNotMatch(currentPrompt, /## Work: REMAP AI/);

const projectPrompt = buildConversationPrompt(message("What's Oriexa?"));
assert.match(projectPrompt, /## Project: Oriexa/);
assert.doesNotMatch(projectPrompt, /## Project: Sayings/);

const contactPrompt = buildConversationPrompt(message("How can I reach you?"));
assert.match(contactPrompt, /# Contact skill/);
assert.match(contactPrompt, /Haseebarshad992@gmail\.com/);
assert.doesNotMatch(contactPrompt, /## Technical toolbox/);

// The compound question must carry both the project notes and the contact
// details, so neither half of the answer has to be improvised.
const compoundPrompt = buildConversationPrompt(
  message("Tell me about Oriexa and how I can reach you.")
);
assert.match(compoundPrompt, /## Project: Oriexa/);
assert.match(compoundPrompt, /Haseebarshad992@gmail\.com/);

const chronologyPrompt = buildConversationPrompt(message("Where did you work before Summon?"));
assert.match(chronologyPrompt, /## Work: Summon Electronics/);
assert.match(chronologyPrompt, /## Work: REMAP AI/);

const personalPrompt = buildConversationPrompt(message("What music do you listen to?"));
assert.match(personalPrompt, /# Personal skill/);
assert.match(personalPrompt, /## Personal life/);
assert.match(personalPrompt, /Haseeb listens to jazz/);
// A music question should not drag the whole employment history into context.
assert.doesNotMatch(personalPrompt, /## Work: Summon Electronics/);

const chessPrompt = buildConversationPrompt(message("Do you play chess?"));
assert.match(chessPrompt, /chess\.com/);
assert.match(chessPrompt, /Peak rating is 1400/);
assert.doesNotMatch(chessPrompt, /## Work: Summon Electronics/);

const bookPrompt = buildConversationPrompt(message("What's your favourite book?"));
assert.match(bookPrompt, /The Rosie Project/);

// Live notes are absent unless the caller supplies them.
assert.doesNotMatch(personalPrompt, /# Live notes supplied for this turn/);

const livePrompt = buildConversationPrompt(message("What are you reading?"), [
  { label: "Currently reading", value: "Designing Data-Intensive Applications" },
  { label: "  Spaced  label ", value: "  collapsed   whitespace  " },
  { label: "Too long", value: "x".repeat(241) },
  { label: "", value: "dropped for having no label" },
]);
assert.match(livePrompt, /# Live notes supplied for this turn/);
assert.match(livePrompt, /- Currently reading: Designing Data-Intensive Applications/);
assert.match(livePrompt, /- Spaced label: collapsed whitespace/);
assert.doesNotMatch(livePrompt, /x{241}/, "An over-length live note should be dropped.");
assert.doesNotMatch(livePrompt, /dropped for having no label/);

// Goblin mode is opt-in and must not leak into a default turn.
const plainPrompt = buildConversationPrompt(message("What do you do?"));
assert.doesNotMatch(plainPrompt, /# Goblin mode/);
assert.doesNotMatch(plainPrompt, /Voice override active for this turn/);

const goblinPrompt = buildConversationPrompt(message("What do you do?"), [], {
  goblin: true,
});
assert.match(goblinPrompt, /Voice override active for this turn/);
assert.match(goblinPrompt, /# Goblin mode/);
// The costume must not strip the grounding.
assert.match(goblinPrompt, /supplied public notes are the only authority/);
assert.match(goblinPrompt, /Do not use em dashes or en dashes/);
assert.match(goblinPrompt, /## Snapshot/);

console.log(`Verified ${topicCases.length + 28} conversation routing and prompt checks.`);
