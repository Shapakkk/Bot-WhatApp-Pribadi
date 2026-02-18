module.exports = {
  apps : [{
    name: 'bot-pribadi',
    script: 'index.js',
    watch: true,
    // INI KUNCI AGAR TIDAK RESTART SAAT INPUT DATA
    ignore_watch: ["node_modules", "auth_info", "database"],
    watch_options: {
      "followSymlinks": false
    },
    env: {
      NODE_ENV: "production",
    }
  }]
}