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

const chronologyPrompt = buildConversationPrompt(message("Where did you work before Summon?"));
assert.match(chronologyPrompt, /## Work: Summon Electronics/);
assert.match(chronologyPrompt, /## Work: REMAP AI/);

console.log(`Verified ${topicCases.length + 6} conversation routing and prompt checks.`);
