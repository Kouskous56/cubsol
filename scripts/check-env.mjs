import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);
const requiredNode = [22, 13, 0];
const requiredPnpm = packageJson.packageManager.replace("pnpm@", "");
const results = [];

function commandVersion(label, command, args, expected, required = true) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const value = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  const passed = result.status === 0 && (!expected || value.includes(expected));
  results.push({ label, passed, required, value: value.split(/\r?\n/)[0] });
}

function isAtLeast(current, minimum) {
  for (let index = 0; index < minimum.length; index += 1) {
    if (current[index] > minimum[index]) return true;
    if (current[index] < minimum[index]) return false;
  }
  return true;
}

const currentNode = process.versions.node.split(".").map(Number);
results.push({
  label: "Node.js",
  passed: isAtLeast(currentNode, requiredNode),
  required: true,
  value: process.version,
});

commandVersion("pnpm", "pnpm", ["--version"], requiredPnpm);
commandVersion("Git", "git", ["--version"], "git version");
commandVersion("GitHub CLI", "gh", ["--version"], "gh version", false);

console.log("CubSol environment check");
console.log(`Workspace: ${root}`);
for (const result of results) {
  const symbol = result.passed ? "✓" : result.required ? "✗" : "!";
  const detail = result.value || "không tìm thấy trong PATH";
  console.log(`${symbol} ${result.label}: ${detail}`);
}

if (root.toLowerCase().includes("onedrive")) {
  console.log(
    "! Workspace nằm trong OneDrive; không đồng bộ node_modules, .pnpm-store và output build.",
  );
}

const failures = results.filter((result) => result.required && !result.passed);
if (failures.length > 0) {
  console.error("\nMôi trường chưa đạt yêu cầu CubSol.");
  process.exit(1);
}

console.log("\nMôi trường đạt yêu cầu phát triển CubSol.");
