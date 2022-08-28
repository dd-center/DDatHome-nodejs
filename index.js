#!/usr/bin/env node

const { version: VERSION } = require('./package.json')
const { URL } = require('url') // Compatibility
const DDAtHome = require('./core')
const neodoc = require('neodoc')

const args = neodoc.run(`Start DD@Home client.

Usage:
  DDatHome-nodejs [options]
  
Options:
  --url=<URL>        URL to the websocket server.
                     [env: URL] [default: wss://cluster.vtbs.moe]
                     
  --interval=<time>  Interval to pull tasks (ms).
                     [env: INTERVAL] [default: 1280]

  --ws-limit=<limit> Limit of WebSocket connections to live.bilibili.com.
                     [env: LIMIT]

  --uuid=<uuid>      UUID for stats tracking.
                     [env: UUID]
                     
  --anonymous        Do not send platform info to the server.
                     [env: HIDE]
                     
  --nickname=<name>  Use a nickname. [env: NICKNAME]
  --verbose          Be more verbose. [env: VERBOSE]
`, { version: VERSION })

if (process.env.development) {
  console.log('Development Environment Detected')
}

start({
  url: process.env.development ? 'ws://0.0.0.0:9013' : args['--url'],
  interval: args['--interval'] ?? process.env.DD_INTERVAL,
  anonymous: args['--anonymous'] ?? process.env.DD_ANONYMOUS,
  nickname: args['--nickname'] ?? process.env.DD_NICKNAME,
  limit: args['--ws-limit'] ?? process.env.DD_WS_LIMIT,
  uuid: args['--uuid'] ?? process.env.DD_UUID,
  verbose: process.env.development || args['--verbose']
})

function start({
  url,
  interval = 480,
  anonymous = false,
  nickname,
  limit = Infinity,
  uuid,
  verbose = false
}) {
  console.log(welcome() + '\n')

  url = new URL(url)

  // input such as `false`, `''`
  if ((typeof interval !== 'number' && !interval) || isNaN(Number(interval))) {
    throw new TypeError(`interval is not a number: ${interval}`)
  }
  if ((typeof limit !== 'number' && !limit) || isNaN(Number(limit))) {
    throw new TypeError(`limit is not a number: ${limit}`)
  }

  // env values might be string
  if (typeof interval === 'string') {
    interval = Number(interval)
  }

  if (!anonymous) {
    url.searchParams.set('runtime', `node${process.version}`)
    url.searchParams.set('version', VERSION)
    url.searchParams.set('platform', process.platform)
    if (process.env.docker) {
      url.searchParams.set('docker', 'docker')
    }
    if (uuid) {
      url.searchParams.set('uuid', uuid)
    }
  }

  if (nickname) {
    url.searchParams.set('name', nickname)
  }

  console.log({
    INTERVAL: interval,
    limit,
    verbose
  })
  console.log(`using: ${url}\n`)

  const ws = new DDAtHome(url, { INTERVAL: interval, wsLimit: limit })

  if (verbose) {
    ws.on('log', console.log)
  }
}

function welcome() {
  return `${'D'.repeat(Math.max(10, process.stdout.columns - 1))}
Thank you for participating DD@Home,
Please read README.md for more information;
Type -h for command line options.
${'D'.repeat(Math.max(10, process.stdout.columns - 1))}`
}
