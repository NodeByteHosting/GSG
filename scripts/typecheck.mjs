#!/usr/bin/env node

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const ROOT_TS = ["index.ts", "compose.ts", "settings.ts", "steam.ts"];
const RECIPE_FILES = ["index.ts", "install.ts", "settings.ts"];
const IGNORE = new Set([".git", ".github", "scripts"]);

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

const files = [];

for (const file of ROOT_TS) {
  if (isFile(join(ROOT, file))) {
    files.push(file);
  }
}

for (const entry of readdirSync(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory() || IGNORE.has(entry.name)) {
    continue;
  }

  const dir = join(ROOT, entry.name);
  const hasRecipe = RECIPE_FILES.some((f) => isFile(join(dir, f)));
  if (!hasRecipe) {
    continue;
  }

  for (const file of RECIPE_FILES) {
    const rel = `${entry.name}/${file}`;
    if (isFile(join(ROOT, rel))) {
      files.push(rel);
    }
  }
}

if (files.length === 0) {
  console.error("No TypeScript files found for recipe type-check.");
  process.exit(1);
}

const result = spawnSync("deno", ["check", "--sloppy-imports", ...files], {
  cwd: ROOT,
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
