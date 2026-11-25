import { readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ignoredDirectories = new Set([
  "node_modules",
  "archive",
  "archives",
  "backup",
  "backups",
  "coverage",
  "dist",
]);

const sourceFiles = [];
const collect = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name.toLowerCase())) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(entryPath);
    else if (entry.isFile() && entry.name.endsWith(".js")) sourceFiles.push(entryPath);
  }
};

for (const root of ["src", "routes", "tools"]) {
  try {
    collect(root);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
for (const source of ["seed-admin.js"]) sourceFiles.push(source);

for (const file of sourceFiles) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  process.stdout.write(`Syntax checked ${sourceFiles.length} backend JavaScript files.\n`);
}
