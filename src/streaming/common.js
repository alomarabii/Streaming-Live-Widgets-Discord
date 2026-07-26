import fs from "node:fs";
import { fetchWithRetry } from "../http.js";
import { updateDiscordWidget } from "../discord.js";

export function loadEnvFile(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Configuration file not found: ${file}`);
  }
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

export function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing configuration: ${name}`);
  return value;
}

export function optional(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

export function positiveInteger(name, fallback) {
  const value = Number(optional(name, String(fallback)));
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

export async function apiJson(url, options, requestConfig) {
  const response = await fetchWithRetry(url, options, requestConfig);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`API request failed (HTTP ${response.status}): ${text.slice(0, 500)}`);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`API returned invalid JSON from ${new URL(url).hostname}`);
  }
}

export async function apiText(url, options, requestConfig) {
  const response = await fetchWithRetry(url, options, requestConfig);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Public page request failed (HTTP ${response.status}).`);
  }
  return text.trim();
}

export function textField(name, value) {
  const text = String(value ?? "—");
  return { type: 1, name, value: text.length > 500 ? `${text.slice(0, 497)}...` : text };
}

export function numberField(name, value) {
  const numeric = Number(value);
  return { type: 2, name, value: Number.isFinite(numeric) ? numeric : 0 };
}

export function imageField(name, url) {
  return url ? { type: 3, name, value: { url } } : null;
}

export function formatDuration(startedAt) {
  if (!startedAt) return "—";
  const elapsed = Math.max(0, Date.now() - new Date(startedAt).getTime());
  const totalMinutes = Math.floor(elapsed / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function compactNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
    .format(number);
}

export function buildPayload(username, fields) {
  return {
    username,
    data: { dynamic: fields.filter(Boolean) },
  };
}

function discordConfig(prefix, requestConfig) {
  return {
    applicationId: required(`${prefix}_DISCORD_APP_ID`),
    userId: required(`${prefix}_DISCORD_USER_ID`),
    botToken: required(`${prefix}_DISCORD_BOT_TOKEN`),
    ...requestConfig,
  };
}

export async function runService({ platform, prefix, envFile, fetchSnapshot }) {
  loadEnvFile(envFile);
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const once = dryRun || args.has("--once");
  const intervalSeconds = positiveInteger("UPDATE_INTERVAL_SECONDS", 60);
  const requestConfig = {
    timeoutMs: positiveInteger("REQUEST_TIMEOUT_MS", 20_000),
    maxRetries: positiveInteger("MAX_RETRIES", 3),
  };
  let running = false;

  async function sync() {
    if (running) return;
    running = true;
    try {
      const snapshot = await fetchSnapshot(requestConfig);
      const payload = buildPayload(
        optional(`${prefix}_DISCORD_WIDGET_USERNAME`, `${platform} Live`),
        snapshot.fields,
      );
      if (dryRun) {
        console.log(JSON.stringify({ platform, snapshot, discordBody: payload }, null, 2));
      } else {
        await updateDiscordWidget(discordConfig(prefix, requestConfig), payload);
      }
      console.log(`[${new Date().toISOString()}] ${platform} widget updated.`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ${platform} failed: ${error.message}`);
      if (once) process.exitCode = 1;
    } finally {
      running = false;
    }
  }

  await sync();
  if (!once) setInterval(sync, intervalSeconds * 1000);
}

