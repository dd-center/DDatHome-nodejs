import version from './version.cjs'
import DDAtHome from './core.js'

const VERSION = version()

const interval = 480

const url = new URL('wss://cluster.vtbs.moe')

url.searchParams.set('runtime', `node${process.version}`)
url.searchParams.set('version', VERSION)
url.searchParams.set('platform', process.platform)
if (process.env.docker) {
  url.searchParams.set('docker', 'docker')
}

const name = `CI-Runner-${Math.random()}`

url.searchParams.set('name', name)

const ws = new DDAtHome(url, { INTERVAL: interval })

ws.on('log', console.log)

let resolves = 0
ws.on('done', () => resolves++)

setInterval(async () => {
  if (resolves > 5) {
    const homes = await ws.ask('homes').catch(() => {
      console.error('ask reject')
      process.exit(1)
    })
    const current = homes.find(({ name: n }) => n === name)
    if (!current) {
      console.error('no current')
      process.exit(1)
    }
    if (current.resolves <= 0) {
      console.error('no resolve')
      process.exit(1)
    }
    console.log('all right')
    console.log({ resolves, current })
    process.exit(0)
  }
}, 1000 * 5)
