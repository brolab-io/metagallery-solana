module.exports = {
  apps: [
    {
      name: "metagallery-solana-fe",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "./",
      instances: "1",
      exec_mode: "cluster",
      max_memory_restart: "500M",
      env: {
        PORT: 3100,
        NODE_ENV: "production",
      },
    },
  ],
};
