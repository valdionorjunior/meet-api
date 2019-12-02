import * as fs from "fs";

export const environment = {
  server: {port: process.env.SERVER_PORT || 3000},
  db: {url: process.env.DB_URL || 'mongodb+srv://junior:bwi280281@cluster0-58kv2.gcp.mongodb.net/meet-api?retryWrites=true&w=majority'},
  security: {
    saltRounds: process.env.SALT_ROUNDS || 10,
    apiSecret: process.env.API_SECRET || 'meet-api-secret',//chave para assinatura de token jwt
    enableHTTPS: process.env.ENABLE_HTTPS || false,//propriedade par ativar ou desativar o envio de certificado
    certificate: process.env.CERT_FILE || './security/keys/cert.pem', //certificado par ahttps
    key: process.env.CERT_KEY_FILE || './security/keys/key.pem' // chave par acertificado de https
  },
  log:{
    level: process.env.LOG_LEVEL || 'debug',
    name: 'meet-api-logger'
  }
}
