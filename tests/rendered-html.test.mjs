import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the CubSol foundation", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="vi">/i);
  assert.match(html, /<title>CubSol — Giải Rubik 3x3 trực quan<\/title>/i);
  assert.match(html, /Từ khối Rubik đang rối/);
  assert.match(html, /Xử lý riêng tư trên thiết bị/);
  assert.match(html, /Quét camera/);
  assert.match(html, /Tải sáu ảnh/);
  assert.match(html, /Điền thủ công/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
