import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PALETTE_PRESETS } from "../src/config/personalization.js";

test("appearance palettes are unique, complete, and valid", () => {
  const ids = PALETTE_PRESETS.map(({ id }) => id);
  assert.deepEqual(ids, ["capsule", "solar", "namek", "kai", "rose"]);
  assert.equal(new Set(ids).size, ids.length);

  for (const palette of PALETTE_PRESETS) {
    assert.ok(palette.name.trim());
    assert.ok(palette.detail.trim());
    assert.equal(palette.colors.length, 3);
    for (const color of palette.colors) assert.match(color, /^#[\da-f]{6}$/i);
  }
});

test("each palette preset has dashboard theme styling", async () => {
  const stylesheet = await readFile(new URL("../src/styles/Dashboard.css", import.meta.url), "utf8");
  assert.match(stylesheet, /--theme-accent:\s*#61c7ef/i);
  for (const { id } of PALETTE_PRESETS.filter(({ id }) => id !== "capsule")) {
    assert.ok(stylesheet.includes(`[data-theme="${id}"]`), `missing dashboard styles for ${id}`);
  }
});
