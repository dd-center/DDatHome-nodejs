const WebSocket = require('ws')

const url = process.env.development ? 'ws://0.0.0.0:9013' : 'wss://cluster.vtbs.moe'

if (process.env.development) {
  console.log('Development Environment Detected')
}

console.log(`using: ${url}`)

const connect = () => {
  const ws = new WebSocket(url)

  ws.on('open', () => {
    console.log('DD@Home connected')
  })

  ws.on('error', e => {
    console.error(`error: ${e.message}`)
  })

  ws.on('close', n => {
    console.log(`closed ${n}`)
    connect()
  })

  ws.on('message', data => {
    console.log(data)
  })
}

connect()
