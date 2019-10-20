const { version: VERSION } = require('./package.json')
const { URL } = require('url') // Compatibility
const WebSocket = require('ws')
const got = require('got')

console.log(`
${Array(process.stdout.columns).fill('D').join('')}
Thank you for participating DD@Home,
Please read README.md for more information.
${Array(process.stdout.columns).fill('D').join('')}
`)

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

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

const url = new URL(process.env.url || process.env.development ? 'ws://0.0.0.0:9013' : 'wss://cluster.vtbs.moe')

let done = 0
const PARALLEL = 128
const INTERVAL = Number.isNaN(Number(process.env.interval)) ? 480 : Number(process.env.interval)

if (!process.env.hide) {
  url.searchParams.set('runtime', `node${process.version}`)
  url.searchParams.set('version', VERSION)
  url.searchParams.set('platform', process.platform)
  if (process.env.docker) {
    url.searchParams.set('docker', 'docker')
  }
}

if (process.env.nickname) {
  url.searchParams.set('name', process.env.nickname)
}

const verbose = process.env.development || process.env.verbose
const log = verbose ? console.log : () => {}

if (verbose) {
  console.log('verbose log: on')
} else {
  console.log('verbose log: off')
}

if (process.env.development) {
  console.log('Development Environment Detected')
}

console.log({
  INTERVAL
})

console.log(`using: ${url}`)

const connect = () => new Promise(resolve => {
  const ws = new WebSocket(url)

  let pending = []

  const secureSend = data => {
    if (ws.readyState === 1) {
      ws.send(data)
      return true
    }
  }

  const processer = async () => {
    await wait(INTERVAL * PARALLEL * Math.random())
    while (true) {
      const now = Date.now()
      const { key, url } = await new Promise(resolve => {
        pending.push(resolve)
        secureSend('DDhttp')
      })
      const time = Date.now()
      const { body } = await got(url).catch(e => ({ body: JSON.stringify({ code: e.statusCode }) }))
      const result = secureSend(JSON.stringify({
        key,
        data: body
      }))
      if (result) {
        if (verbose) {
          done++
        }
        log(`job complete ${((Date.now() - time) / 1000).toFixed(2)}s`, Math.round(process.uptime() * 1000 / done), INTERVAL * PARALLEL - Date.now() + now)
      }
      await wait(INTERVAL * PARALLEL - Date.now() + now)
    }
  }

  ws.on('message', async message => {
    const json = parse(message)
    if (json) {
      const resolve = pending.shift()
      if (resolve) {
        log('job received', json.url)
        resolve(json)
      }
    }
  })

  ws.on('open', () => {
    log('DD@Home connected')
    Array(PARALLEL).fill().map(processer)
  })

  ws.on('error', e => {
    console.error(`error: ${e.message}`)
  })

  ws.on('close', n => {
    log(`closed ${n}`)
    setTimeout(resolve, 1000)
  })
})

;

(async () => {
  while (true) {
    await connect()
  }
})()
