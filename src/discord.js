import { fetchWithRetry } from "./http.js";

export async function updateDiscordWidget(config, body) {
  const url =
    `https://discord.com/api/v9/applications/${encodeURIComponent(config.applicationId)}` +
    `/users/${encodeURIComponent(config.userId)}/identities/0/profile`;

  const response = await fetchWithRetry(
    url,
    {
      method: "PATCH",
      headers: {
        authorization: `Bot ${config.botToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
    config,
  );

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    throw new Error(
      `Discord update failed (HTTP ${response.status}): ${details}`,
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}


