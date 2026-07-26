import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { loadEnvFile, positiveInteger, sanitizeEnvValue } from "../src/streaming/common.js";

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "streaming-widgets-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("loadEnvFile only loads files inside the current working directory", () => {
  const cwd = process.cwd();
  withTempDir((dir) => {
    const outsideFile = path.join(dir, "outside.env");
    fs.writeFileSync(outsideFile, "SECRET=value\n", "utf8");
    const previousCwd = process.cwd();
    process.chdir(dir);
    try {
      assert.throws(() => loadEnvFile(path.join(dir, "..", "outside.env")), /outside the allowed/);
    } finally {
      process.chdir(previousCwd);
    }
  });
});

test("loadEnvFile rejects directories and non-file paths", () => {
  withTempDir((dir) => {
    const previousCwd = process.cwd();
    process.chdir(dir);
    try {
      assert.throws(() => loadEnvFile(dir), /must be a regular file/);
    } finally {
      process.chdir(previousCwd);
    }
  });
});

test("positiveInteger enforces a safe upper bound", () => {
  process.env.REQUEST_TIMEOUT_MS = "90000";
  try {
    assert.throws(() => positiveInteger("REQUEST_TIMEOUT_MS", 20_000, 60_000), /no greater than/);
  } finally {
    delete process.env.REQUEST_TIMEOUT_MS;
  }
  assert.equal(positiveInteger("UPDATE_INTERVAL_SECONDS", 60, 3_600), 60);
});

test("sanitizeEnvValue rejects control characters and overly long values", () => {
  assert.throws(() => sanitizeEnvValue("YOUTUBE_CHANNEL_NAME", "bad\nvalue"), /control characters/);
  assert.throws(() => sanitizeEnvValue("YOUTUBE_CHANNEL_NAME", "a".repeat(6_001)), /too long/);
  assert.equal(sanitizeEnvValue("YOUTUBE_CHANNEL_NAME", "MyChannel"), "MyChannel");
});
