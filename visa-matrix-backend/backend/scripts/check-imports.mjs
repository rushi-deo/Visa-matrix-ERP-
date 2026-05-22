import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const srcRoot = resolve("src");
const importRe = /from\s+['"](\.[^'"]+)['"]/g;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      walk(fullPath, files);
    } else if (fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

const missing = [];

for (const file of walk(srcRoot)) {
  const content = readFileSync(file, "utf8");
  let match;
  while ((match = importRe.exec(content))) {
    const spec = match[1];
    const base = dirname(file);
    let target = resolve(base, spec);
    if (!target.endsWith(".js")) {
      target += ".js";
    }

    try {
      statSync(target);
    } catch {
      missing.push({ file, spec, resolved: target });
    }
  }
}

missing.sort((a, b) => a.file.localeCompare(b.file));

for (const item of missing) {
  console.log(`${item.file} -> ${item.spec} => ${item.resolved}`);
}

console.log(`TOTAL_MISSING: ${missing.length}`);
process.exit(missing.length > 0 ? 1 : 0);
