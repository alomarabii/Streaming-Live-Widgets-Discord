import fs from "node:fs";
import path from "node:path";
import { fetchWithRetry } from "../http.js";
import { updateDiscordWidget } from "../discord.js";

const ENV_VALUE_MAX_LENGTH = 4_000;

function isSafeEnvValue(value) {
  return typeof value === "string" && !/[\x00-\x1F\x7F]/.test(value) && value.length <= ENV_VALUE_MAX_LENGTH;
}

export function sanitizeEnvValue(name, value) {
  if (value === undefined || value === null) {
    return "";
  }
  const normalized = String(value).trim();
  if (!isSafeEnvValue(normalized)) {
    if (/[\x00-\x1F\x7F]/.test(normalized)) {
      throw new Error(`${name} contains control characters.`);
    }
    if (normalized.length > ENV_VALUE_MAX_LENGTH) {
      throw new Error(`${name} is too long.`);
    }
  }
  return normalized;
}

function resolveAllowedFile(file) {
  const candidate = String(file ?? "").trim();
  if (!candidate) {
    throw new Error("Configuration file path is empty.");
  }

  const allowedRoot = path.resolve(process.cwd());
  const absolutePath = path.isAbsolute(candidate)
    ? path.resolve(candidate)
    : path.resolve(allowedRoot, candidate);

  const relativePath = path.relative(allowedRoot, absolutePath).replace(/\\/g, "/");
  if (relativePath === "" || relativePath === ".") {
    // allow the current working directory itself only when the caller specifically targets a file
  } else if (relativePath.startsWith("../") || relativePath === ".." || path.isAbsolute(relativePath)) {
    throw new Error(`Configuration path is outside the allowed directory: ${file}`);
  }

  let stat;
  try {
    stat = fs.statSync(absolutePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Configuration file not found: ${file}`);
    }
    throw error;
  }

  if (!stat.isFile()) {
    throw new Error(`Configuration path must be a regular file: ${file}`);
  }

  try {
    const realPath = fs.realpathSync.native(absolutePath);
    const realRelative = path.relative(allowedRoot, realPath).replace(/\\/g, "/");
    if (realRelative.startsWith("../") || realRelative === ".." || path.isAbsolute(realRelative)) {
      throw new Error(`Configuration path is outside the allowed directory: ${file}`);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Configuration file not found: ${file}`);
    }
    throw error;
  }

  return absolutePath;
}

export function loadEnvFile(file) {
  const safeFile = resolveAllowedFile(file);
  for (const rawLine of fs.readFileSync(safeFile, "utf8").split(/\r?\n/)) {
    const line = rawLine.replace(/^\uFEFF/, "").trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = sanitizeEnvValue(key, value);
  }
}

export function required(name) {
  const value = sanitizeEnvValue(name, process.env[name]);
  if (!value) throw new Error(`Missing configuration: ${name}`);
  return value;
}

export function optional(name, fallback = "") {
  return sanitizeEnvValue(name, process.env[name]) || fallback;
}

export function positiveInteger(name, fallback, upperBound = Number.POSITIVE_INFINITY) {
  const value = Number(optional(name, String(fallback)));
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  if (Number.isFinite(upperBound) && value > upperBound) {
    throw new Error(`${name} must be a positive integer no greater than ${upperBound}.`);
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

export function formatRelativeTime() {
  return "Just now";
}

export async function fetchGameImage(gameName, requestConfig) {
  try {
    const clientId = optional("IGDB_CLIENT_ID", "");
    const accessToken = optional("IGDB_ACCESS_TOKEN", "");

    // Return null if IGDB is not configured
    if (!clientId || !accessToken) {
      return null;
    }

    const response = await apiJson(
      "https://api.igdb.com/v4/games",
      {
        method: "POST",
        headers: {
          "Client-ID": clientId,
          "Authorization": `Bearer ${accessToken}`,
        },
        body: `search "${gameName}"; fields cover.url, name; limit 1;`,
      },
      requestConfig,
    );

    // IGDB returns cover URLs without protocol
    if (Array.isArray(response) && response[0]?.cover?.url) {
      return `https:${response[0].cover.url.replace("t_thumb", "t_cover_big")}`;
    }
    return null;
  } catch {
    // Silently fail - game image is optional
    return null;
  }
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
  try {
    loadEnvFile(envFile);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ${platform} startup failed: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const once = dryRun || args.has("--once");
  const intervalSeconds = positiveInteger("UPDATE_INTERVAL_SECONDS", 60, 3_600);
  const requestConfig = {
    timeoutMs: positiveInteger("REQUEST_TIMEOUT_MS", 20_000, 60_000),
    maxRetries: positiveInteger("MAX_RETRIES", 3, 10),
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
      const details = error instanceof Error ? error.message : String(error);
      console.error(`[${new Date().toISOString()}] ${platform} failed: ${details}`);
      if (once) process.exitCode = 1;
    } finally {
      running = false;
    }
  }

  await sync();
  if (!once) {
    const timer = setInterval(sync, intervalSeconds * 1000);
    process.on("SIGINT", () => clearInterval(timer));
    process.on("SIGTERM", () => clearInterval(timer));
  }
}

