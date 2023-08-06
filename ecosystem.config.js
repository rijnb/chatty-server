module.exports = {
  apps: [
    {
      name: "chatty",
      script: "server.js",
      args: "start -p " + (process.env.PORT || 3000),
      watch: false,
      autorestart: true,
    }
  ]
}
