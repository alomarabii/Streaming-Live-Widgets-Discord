import {
  apiText,
  imageField,
  numberField,
  optional,
  required,
  runService,
  textField,
} from "./common.js";

function jsonObjectAfter(html, marker, from = 0) {
  const markerAt = html.indexOf(marker, from);
  if (markerAt < 0) return null;
  const start = html.indexOf("{", markerAt + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const char = html[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) {
      try {
        return JSON.parse(html.slice(start, index + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function findValue(value, key) {
  if (!value || typeof value !== "object") return null;
  if (Object.hasOwn(value, key)) return value[key];
  for (const child of Object.values(value)) {
    const found = findValue(child, key);
    if (found !== null) return found;
  }
  return null;
}

function textValue(value) {
  return value?.simpleText ||
    value?.runs?.map((run) => run.text).join("") ||
    value?.accessibility?.accessibilityData?.label ||
    "";
}

function numeric(value) {
  const text = String(value || "").toUpperCase().replace(/,/g, "");
  const match = text.match(/([\d.]+)\s*([KMB])?/);
  if (!match) return null;
  const scale = { K: 1e3, M: 1e6, B: 1e9 }[match[2]] || 1;
  return Math.round(Number(match[1]) * scale);
}

async function fetchSnapshot(config) {
  const name = required("YOUTUBE_CHANNEL_NAME")
    .replace(/^https?:\/\/(www\.)?youtube\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  const url = `https://www.youtube.com/@${encodeURIComponent(name)}`;
  const headers = { "accept-language": "en-US,en;q=0.9" };
  const [html, liveHtml] = await Promise.all([
    apiText(url, { headers }, config),
    apiText(`${url}/live`, { headers }, config),
  ]);
  const metadata = jsonObjectAfter(html, '"channelMetadataRenderer":') || {};
  if (!metadata.externalId) throw new Error("YouTube channel was not found.");
  const header = jsonObjectAfter(html, '"pageHeaderRenderer":') || {};
  const subscribersText = textValue(findValue(header, "subscriberCountText"));
  const videosText = textValue(findValue(header, "videoCountText"));
  const avatar = metadata.avatar?.thumbnails?.at(-1)?.url;
  const live = liveHtml.includes('"isLiveNow":true');
  const videoId = live
    ? liveHtml.match(/"videoId":"([^"]+)"/)?.[1]
    : "";
  const liveRenderer = live ? jsonObjectAfter(liveHtml, '"videoRenderer":') : null;
  const viewersText = textValue(findValue(liveRenderer, "viewCountText"));

  return {
    live,
    fields: [
      textField("channel_name", metadata.title),
      imageField("avatar", avatar),
      textField("description", metadata.description || "—"),
      textField("status", live ? "LIVE" : "OFFLINE"),
      textField("stream_title", textValue(liveRenderer?.title) || "Not live"),
      imageField("thumbnail", liveRenderer?.thumbnail?.thumbnails?.at(-1)?.url),
      numberField("subscribers", numeric(subscribersText)),
      textField("subscribers_display", subscribersText || "Not publicly available"),
      numberField("videos", numeric(videosText)),
      textField("videos_status", videosText || "Not publicly available"),
      numberField("live_viewers", live ? numeric(viewersText) : 0),
      textField("channel_url", url),
      textField("stream_url", videoId ? `https://youtube.com/watch?v=${videoId}` : "—"),
      textField("updated_at", new Date().toISOString()),
    ],
  };
}

await runService({
  platform: "YouTube",
  prefix: "YOUTUBE",
  envFile: optional("STREAMING_ENV_FILE", ".env.streaming"),
  fetchSnapshot,
});

