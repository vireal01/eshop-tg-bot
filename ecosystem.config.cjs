module.exports = {
  apps : [{
    name   : "tg_bot",
    script : "./index.js",
    env_production: {
       NODE_ENV: "production"
    }
  }]
}
