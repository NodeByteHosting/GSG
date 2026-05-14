#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

const REQUIRED_FILES = ["index.ts", "install.ts", "settings.ts"];
const IGNORED_DIRS = new Set([".git", ".github", "scripts"]);

const fail = (message) => {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
};

const read = (path) => readFileSync(path, "utf-8");

const isFile = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

const getCandidateGameDirs = () => {
  const entries = readdirSync(ROOT, { withFileTypes: true });
  const dirs = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (IGNORED_DIRS.has(entry.name)) {
      continue;
    }

    const full = join(ROOT, entry.name);
    const hasAnyRecipeFile = REQUIRED_FILES.some((file) => {
      try {
        return statSync(join(full, file)).isFile();
      } catch {
        return false;
      }
    });

    if (hasAnyRecipeFile) {
      dirs.push(entry.name);
    }
  }

  return dirs.toSorted();
};

const parseRootImports = (indexSource) => {
  const importRegex =
    /import\s+\{\s*([a-zA-Z0-9_]+)\s*\}\s+from\s+"\.\/([a-z0-9-]+)";/gu;
  const imports = new Map();
  let match;

  while ((match = importRegex.exec(indexSource)) !== null) {
    imports.set(match[2], match[1]);
  }

  return imports;
};

const parseGamesArraySymbols = (indexSource) => {
  const arrayMatch = indexSource.match(
    /export const games = \[([\s\S]*?)\];/mu
  );
  if (!arrayMatch) {
    fail("games/index.ts must export `games` array.");
    return [];
  }

  return arrayMatch[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s*\/\/.*$/u, ""))
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseRecipeId = (recipeIndexSource) => {
  const match = recipeIndexSource.match(/\bid\s*:\s*"([a-z0-9-]+)"/u);
  return match ? match[1] : null;
};

const validateRecipeShape = (gameDir, recipeIndexSource) => {
  const requiredMarkers = [
    /\bname\s*:/u,
    /\bdescription\s*:/u,
    /\benabled\s*:/u,
    /\bbuildCompose\b/u,
    /\bdockerImage\b/u,
    /\bports\s*:/u,
    /\brequirements\s*:/u,
    /\bsettings\s*:/u,
  ];

  for (const marker of requiredMarkers) {
    if (!marker.test(recipeIndexSource)) {
      fail(
        `${gameDir}/index.ts is missing expected recipe field matching ${marker}`
      );
    }
  }
};

const main = () => {
  const rootIndexPath = join(ROOT, "index.ts");
  const rootSettingsPath = join(ROOT, "settings.ts");
  const rootComposePath = join(ROOT, "compose.ts");

  for (const requiredRootFile of [
    rootIndexPath,
    rootSettingsPath,
    rootComposePath,
  ]) {
    if (!isFile(requiredRootFile)) {
      fail(`Missing required root file: ${requiredRootFile}`);
    }
  }

  const rootIndexSource = read(rootIndexPath);
  const imports = parseRootImports(rootIndexSource);
  const gameSymbols = new Set(parseGamesArraySymbols(rootIndexSource));

  const gameDirs = getCandidateGameDirs();
  const seenIds = new Set();

  for (const gameDir of gameDirs) {
    const dirPath = join(ROOT, gameDir);

    for (const file of REQUIRED_FILES) {
      const filePath = join(dirPath, file);
      try {
        if (!statSync(filePath).isFile()) {
          fail(`Missing ${gameDir}/${file}`);
        }
      } catch {
        fail(`Missing ${gameDir}/${file}`);
      }
    }

    const recipeIndexSource = read(join(dirPath, "index.ts"));
    validateRecipeShape(gameDir, recipeIndexSource);

    const recipeId = parseRecipeId(recipeIndexSource);
    if (recipeId) {
      if (recipeId !== gameDir) {
        fail(
          `${gameDir}/index.ts id '${recipeId}' must match directory name '${gameDir}'`
        );
      }
      if (seenIds.has(recipeId)) {
        fail(`Duplicate game id '${recipeId}'`);
      }
      seenIds.add(recipeId);
    } else {
      fail(`${gameDir}/index.ts is missing literal id value`);
    }

    const importedSymbol = imports.get(gameDir);
    if (importedSymbol) {
      if (!gameSymbols.has(importedSymbol)) {
        fail(
          `games/index.ts games array is missing symbol '${importedSymbol}' for ./${gameDir}`
        );
      }
    } else {
      fail(`games/index.ts is missing import for ./${gameDir}`);
      continue;
    }
  }

  for (const [dirName, symbol] of imports.entries()) {
    if (gameDirs.includes(dirName)) {
      if (!gameSymbols.has(symbol)) {
        fail(
          `games/index.ts imports '${symbol}' from ./${dirName} but does not include it in games array`
        );
      }
    } else {
      fail(
        `games/index.ts imports ./${dirName}, but no recipe files were detected in that directory`
      );
      continue;
    }
  }

  if (process.exitCode && process.exitCode !== 0) {
    return;
  }

  console.log(`OK: validated ${gameDirs.length} game recipes`);
};

main();
