import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const domainRoot = join(root, "src", "domain");
const forbiddenPackages = new Set([
  "react",
  "zustand",
  "three",
  "next",
  "vinext",
  "@cloudflare",
]);
const violations = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
      continue;
    }
    if (![".ts", ".tsx"].includes(extname(path))) continue;

    const source = readFileSync(path, "utf8");
    const imports = source.matchAll(
      /(?:from\s+|import\s*\()\s*["']([^"']+)["']/g,
    );
    for (const match of imports) {
      const packageName = match[1].startsWith("@")
        ? match[1].split("/").slice(0, 1).join("/")
        : match[1].split("/")[0];
      if (forbiddenPackages.has(packageName)) {
        violations.push(`${relative(root, path)} → ${match[1]}`);
      }
    }
  }
}

walk(domainRoot);

if (violations.length > 0) {
  console.error("Domain boundary violations:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Domain boundary audit: PASS");
