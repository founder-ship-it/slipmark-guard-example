#!/usr/bin/env node
// A stand-in for an AI code reviewer. It reads files and never runs them, so it is
// safe to point at untrusted pull request code. In a real setup this step is your
// agent review; Slipmark doesn't care who gives the verdict, only which bytes it was about.
//
// Usage: node doc-review.mjs <checkout> <file>...
// Rule: every exported function in a reviewed file has a /** doc comment */ directly
// above it, and the file has a sibling <name>.test.js that mentions the function.
// Prints one line per finding, then "verdict=pass" or "verdict=fail".
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const [root, ...files] = process.argv.slice(2);
if (!root || files.length === 0) {
  console.error("usage: doc-review.mjs <checkout> <file>...");
  process.exit(2);
}

const findings = [];
for (const file of files) {
  const text = readFileSync(join(root, file), "utf8");
  const testFile = join(dirname(file), basename(file, ".js") + ".test.js");
  const tests = existsSync(join(root, testFile)) ? readFileSync(join(root, testFile), "utf8") : "";
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const m = /^export (?:async )?function (\w+)/.exec(line);
    if (!m) return;
    const name = m[1];
    if (!/\*\/\s*$/.test(lines[i - 1] ?? "")) findings.push(`${file}:${i + 1} ${name} has no doc comment`);
    if (!new RegExp(`\\b${name}\\b`).test(tests)) findings.push(`${file}:${i + 1} ${name} isn't mentioned in ${testFile}`);
  });
}

for (const f of findings) console.log(f);
console.log(`verdict=${findings.length ? "fail" : "pass"}`);
