import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const services = [
  { name: "YouTube", file: "./youtube.js" },
  { name: "Twitch", file: "./twitch.js" },
  { name: "Kick", file: "./kick.js" },
];
const children = new Map();
let stopping = false;

function start(service) {
  const file = fileURLToPath(new URL(service.file, import.meta.url));
  const child = spawn(process.execPath, [file], {
    stdio: "inherit",
    windowsHide: true,
    env: {
      ...process.env,
      STREAMING_ENV_FILE: process.env.STREAMING_ENV_FILE || ".env.streaming",
    },
  });
  children.set(service.name, child);
  console.log(`[launcher] Started ${service.name} bot (PID ${child.pid}).`);
  child.on("exit", (code, signal) => {
    children.delete(service.name);
    if (stopping) return;
    console.error(
      `[launcher] ${service.name} stopped (${signal || `exit ${code}`}); restarting in 5s.`,
    );
    setTimeout(() => {
      if (!stopping) start(service);
    }, 5_000);
  });
}

function stop() {
  if (stopping) return;
  stopping = true;
  console.log("[launcher] Stopping YouTube, Twitch and Kick bots...");
  for (const child of children.values()) child.kill();
}

for (const service of services) start(service);
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
