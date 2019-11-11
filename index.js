const { version: VERSION } = require('./package.json')
const { URL } = require('url') // Compatibility
const DDAtHome = require('./core')

console.log(`
${Array(process.stdout.columns).fill('D').join('')}
Thank you for participating DD@Home,
Please read README.md for more information.
${Array(process.stdout.columns).fill('D').join('')}
`)

const url = new URL(process.env.url || (process.env.development ? 'ws://0.0.0.0:9013' : 'wss://cluster.vtbs.moe'))

const PARALLEL = 48
const INTERVAL = Number.isNaN(Number(process.env.interval)) ? 480 : Number(process.env.interval)
const PING_INTERVAL = 1000 * 30

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
  INTERVAL,
  verbose,
  log,
  PARALLEL
})

console.log(`using: ${url}`)

const ws = new DDAtHome(url, { PARALLEL, PING_INTERVAL, INTERVAL })

ws.on('log', log)
