module.exports = {
  apps : [{
    name   : "tg_bot",
    script : "./src/index.js",
    env_production: {
       NODE_ENV: "production"
    }
  },
  {
    name   : "gameListRefresher",
    script : "./src/scripts/refreshGamesList.js",
  }
]
}
