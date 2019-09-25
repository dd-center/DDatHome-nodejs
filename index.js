const WebSocket = require('ws')
const got = require('got')

const parse = string => {
  try {
    const json = JSON.parse(string)
    if (json) {
      const { key, data: { type, url } } = json
      if (type === 'http') {
        return { key, url }
      }
    }
  } catch (_) {
    return undefined
  }
}

const url = process.env.development ? 'ws://0.0.0.0:9013' : 'wss://cluster.vtbs.moe'
const PARALLEL = 8
const INTERVAL = 320

if (process.env.development) {
  console.log('Development Environment Detected')
}

console.log(`using: ${url}`)

const connect = () => {
  const ws = new WebSocket(url)

  ws.on('message', async message => {
    const json = parse(message)
    if (json) {
      const { key, url } = json
      console.log('job receive')
      setTimeout(() => ws.send('DDhttp'), INTERVAL * PARALLEL)
      const time = Date.now()
      const { body } = await got(url, { json: true }).catch(() => ({}))
      console.log(`job complete ${((Date.now() - time) / 1000).toFixed(2)}s`)
      ws.send(JSON.stringify({
        key,
        data: body
      }))
    }
  })

  ws.on('open', () => {
    console.log('DD@Home connected')
    ws.send('DDhttp')
    Array(PARALLEL).fill().map(() => ws.send('DDhttp'))
  })

  ws.on('error', e => {
    console.error(`error: ${e.message}`)
  })

  ws.on('close', n => {
    console.log(`closed ${n}`)
    setTimeout(connect, 1000)
  })
}

connect()
