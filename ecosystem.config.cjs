module.exports = {
  apps: [
    {
      name: "streaming-live-widgets",
      script: "src/streaming/all.js",
      cwd: __dirname,
      env_file: ".env.streaming",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 3000,
      kill_timeout: 10000,
      exp_backoff_restart_delay: 2000,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
