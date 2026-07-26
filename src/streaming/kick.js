import {
  apiJson,
  apiText,
  compactNumber,
  formatDuration,
  imageField,
  numberField,
  optional,
  required,
  runService,
  textField,
} from "./common.js";

async function fetchSnapshot(config) {
  const slug = required("KICK_CHANNEL_NAME")
    .replace(/^https?:\/\/(www\.)?kick\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
  const channelUrl =
    `https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`;
  let channel;
  try {
    channel = await apiJson(
      channelUrl,
      {
        headers: {
          accept: "application/json",
          "user-agent": "Mozilla/5.0 (compatible; StreamingDiscordWidget/1.0)",
        },
      },
      config,
    );
  } catch (error) {
    if (!/HTTP 403/.test(error.message)) throw error;
    console.warn("[Kick] Direct request blocked; using the public read-only fallback.");
    const fallbackText = await apiText(
      `https://r.jina.ai/${channelUrl}`,
      { headers: { accept: "text/plain" } },
      config,
    );
    const marker = "Markdown Content:";
    const jsonText = fallbackText.includes(marker)
      ? fallbackText.slice(fallbackText.indexOf(marker) + marker.length).trim()
      : fallbackText;
    try {
      channel = JSON.parse(jsonText);
    } catch {
      throw new Error("Kick fallback returned invalid channel data.");
    }
  }
  if (!channel?.id) throw new Error("Kick channel was not found.");

  const stream = channel.livestream || null;
  const category = stream?.categories?.[0] || channel.recent_categories?.[0];
  const subscribers = channel.active_subscribers_count ??
    channel.subscribers_count ??
    null;
  const followers = channel.followers_count;

  return {
    live: Boolean(stream),
    fields: [
      textField("channel_name", channel.user?.username || channel.slug),
      imageField("avatar", channel.user?.profile_pic),
      imageField("banner", channel.banner_image?.url || channel.offline_banner_image?.url),
      textField("description", channel.user?.bio || "—"),
      textField("verified", channel.verified ? "Verified" : "Not verified"),
      textField("status", stream ? "LIVE" : "OFFLINE"),
      textField("stream_title", stream?.session_title || "Not live"),
      imageField("thumbnail", stream?.thumbnail?.url),
      textField("category", category?.name || "—"),
      imageField("category_image", category?.banner?.url),
      numberField("followers", followers),
      textField("followers_compact", compactNumber(followers)),
      numberField("subscribers", subscribers),
      textField(
        "subscribers_status",
        subscribers === null ? "Not publicly available" : compactNumber(subscribers),
      ),
      numberField("live_viewers", stream?.viewer_count),
      textField("language", stream?.language || "—"),
      textField("uptime", stream ? formatDuration(stream.start_time || stream.created_at) : "—"),
      textField("chat_mode", channel.chatroom?.chat_mode || "—"),
      textField("slow_mode", channel.chatroom?.slow_mode ? "Enabled" : "Disabled"),
      textField("channel_url", `https://kick.com/${slug}`),
      textField("updated_at", new Date().toISOString()),
    ],
  };
}

await runService({
  platform: "Kick",
  prefix: "KICK",
  envFile: optional("STREAMING_ENV_FILE", ".env.streaming"),
  fetchSnapshot,
});
