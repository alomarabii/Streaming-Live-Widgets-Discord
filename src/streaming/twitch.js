import {
  apiText,
  compactNumber,
  imageField,
  numberField,
  optional,
  required,
  runService,
  textField,
} from "./common.js";

async function decapi(endpoint, login, config) {
  try {
    const result = await apiText(
      `https://decapi.me/twitch/${endpoint}/${encodeURIComponent(login)}`,
      {},
      config,
    );
    return /^channel not found$/i.test(result) ? "" : result;
  } catch {
    return "";
  }
}

function numeric(value) {
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchSnapshot(config) {
  const login = required("TWITCH_CHANNEL_NAME")
    .replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
  const [avatar, followersText, viewersText, uptime, title, game, subscribersText] =
    await Promise.all([
      decapi("avatar", login, config),
      decapi("followcount", login, config),
      decapi("viewercount", login, config),
      decapi("uptime", login, config),
      decapi("title", login, config),
      decapi("game", login, config),
      decapi("subcount", login, config),
    ]);
  const live = !/offline/i.test(uptime);
  const followers = numeric(followersText);
  const subscribers = numeric(subscribersText);

  return {
    live,
    fields: [
      textField("channel_name", login),
      imageField("avatar", avatar),
      textField("status", live ? "LIVE" : "OFFLINE"),
      textField("stream_title", title || "—"),
      imageField(
        "thumbnail",
        live
          ? `https://static-cdn.jtvnw.net/previews-ttv/live_user_${login}-1280x720.jpg`
          : null,
      ),
      textField("game", game || "—"),
      numberField("followers", followers),
      textField("followers_compact", compactNumber(followers)),
      numberField("subscribers", subscribers),
      textField(
        "subscribers_status",
        subscribers === null ? "Not publicly available" : compactNumber(subscribers),
      ),
      numberField("live_viewers", live ? numeric(viewersText) : 0),
      textField("uptime", live ? uptime : "—"),
      textField("channel_url", `https://twitch.tv/${login}`),
      textField("updated_at", new Date().toISOString()),
    ],
  };
}

await runService({
  platform: "Twitch",
  prefix: "TWITCH",
  envFile: optional("STREAMING_ENV_FILE", ".env.streaming"),
  fetchSnapshot,
});

