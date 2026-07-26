export async function fetchWithRetry(
  url,
  options = {},
  { timeoutMs = 20_000, maxRetries = 3 } = {},
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "user-agent": "DiscordBot (https://github.com/discord/discord-api-docs, 1.0.0)",
          accept: "application/json, text/html;q=0.9",
          ...options.headers,
        },
      });

      if (response.ok || (response.status < 500 && response.status !== 429)) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status} from ${url}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 750 * 2 ** (attempt - 1)));
    }
  }

  throw lastError;
}

