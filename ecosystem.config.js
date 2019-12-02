module.exports = {
  apps : [{
    name   : "meet-api",
    script : "./dist/main.js",
    instances: 4,
    exec_mode: "cluster",
    watch: true, //substitui o nomemon
    marge_logs: true,
    env: {
      SERVER_PORT: 5000,
      DB_URL: 'mongodb+srv://junior:bwi280281@cluster0-58kv2.gcp.mongodb.net/meet-api?retryWrites=true&w=majority',
      NODE_ENV: "development"
    },
    env_production:{ 
      SERVER_PORT: 5001,
      NODE_ENV: "production"
    }
  }]
}
