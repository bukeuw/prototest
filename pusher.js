const Pusher = require('pusher')
require('dotenv').config()

const config = {
  appId: process.env.FIREBASE_APP_ID || '',
  key: process.env.FIREBASE_KEY || '',
  secret: process.env.FIREBASE_SECRET || '',
  cluster: process.env.FIREBASE_CLUSTER || 'ap1',
  useTLS: process.env.FIREBASE_USE_TLS || true
}

console.log(config)

const pusher = new Pusher(config)

module.exports = pusher
