import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const nextBin = fileURLToPath(
  import.meta.resolve("next/dist/bin/next", import.meta.url),
);

async function reservePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address === "object");
  const { port } = address;
  server.close();
  await once(server, "close");
  return port;
}

async function waitForServer(url, processOutput) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      return await fetch(url, { headers: { accept: "text/html" } });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error(`Next.js did not start in time.\n${processOutput.join("")}`);
}

test("production Next.js server renders the CubSol foundation", async (context) => {
  const port = await reservePort();
  const output = [];
  const server = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: root,
      env: { ...process.env, NODE_ENV: "production" },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );

  server.stdout.on("data", (chunk) => output.push(chunk.toString()));
  server.stderr.on("data", (chunk) => output.push(chunk.toString()));
  context.after(() => server.kill());

  const response = await waitForServer(`http://127.0.0.1:${port}/`, output);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html\b[^>]*\blang="vi"/i);
  assert.match(html, /<title>CubSol — Giải Rubik 3x3 trực quan<\/title>/i);
  assert.match(html, /Từ khối Rubik đang rối/);
  assert.match(html, /Xử lý riêng tư trên thiết bị/);
  assert.match(html, /Quét camera/);
  assert.match(html, /Tải sáu ảnh/);
  assert.match(html, /Điền thủ công/);
  assert.match(html, /nhập chính xác 54 ô màu/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
