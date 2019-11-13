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
                     [env: INTERVAL] [default: 480]
                     
  --anonymous        Do not send platform info to the server.
                     [env: HIDE]
                     
  --nickname=<name>  Use a nickname. [env: NICKNAME]
  --verbose          Be more verbose. [env: VERBOSE]
`, {version: VERSION})

if (process.env.development) {
  console.log('Development Environment Detected')
}

start({
  url: process.env.development ? 'ws://0.0.0.0:9013' : args['--url'],
  interval: args['--interval'],
  anonymous: args['--anonymous'],
  nickname: args['--nickname'],
  verbose: process.env.development || args['--verbose']
})

function start({
  url,
  interval = 480,
  anonymous = false,
  nickname,
  verbose = false
}) {
  console.log(welcome() + '\n')

  url = new URL(url)

  if (!interval || typeof interval !== 'number') {
    throw new TypeError(`interval is not a number: ${interval}`)
  }
  
  if (!anonymous) {
    url.searchParams.set('runtime', `node${process.version}`)
    url.searchParams.set('version', VERSION)
    url.searchParams.set('platform', process.platform)
    if (process.env.docker) {
      url.searchParams.set('docker', 'docker')
    }
  }

  if (nickname) {
    url.searchParams.set('name', nickname)
  }

  console.log({
    INTERVAL: interval,
    verbose
  })
  console.log(`using: ${url}\n`)

  const ws = new DDAtHome(url, { INTERVAL: interval })

  if (verbose) {
    ws.on('log', console.log)
  }
}

function welcome() {
  return `${'D'.repeat(process.stdout.columns - 1)}
Thank you for participating DD@Home,
Please read README.md for more information.
${'D'.repeat(process.stdout.columns - 1)}`
}
