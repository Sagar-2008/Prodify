import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTimerDuration, readTimerDuration } from "../src/config/focusSettings.js";

test("focus and break durations clamp to their supported ranges", () => {
  assert.equal(normalizeTimerDuration(25, 60), 25);
  assert.equal(normalizeTimerDuration(0, 60), 1);
  assert.equal(normalizeTimerDuration(-5, 30), 1);
  assert.equal(normalizeTimerDuration(90, 60), 60);
  assert.equal(normalizeTimerDuration(45, 30), 30);
});

test("duration input rounds to a whole minute and handles empty input", () => {
  assert.equal(normalizeTimerDuration(2.4, 60), 2);
  assert.equal(normalizeTimerDuration(2.6, 60), 3);
  assert.equal(normalizeTimerDuration("", 30), 1);
  assert.equal(normalizeTimerDuration("not a number", 30), 1);
});

test("stored timer duration accepts valid minutes and falls back for invalid values", () => {
  assert.equal(readTimerDuration("40", 25, 60), 40);
  assert.equal(readTimerDuration("31", 5, 30), 5);
  assert.equal(readTimerDuration("0", 25, 60), 25);
  assert.equal(readTimerDuration("2.5", 25, 60), 25);
  assert.equal(readTimerDuration(null, 5, 30), 5);
});
