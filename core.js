const WebSocket = require('ws')
const EventEmitter = require('events')

const relay = require('./relay')

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const parse = string => {
  if (string === 'wait') {
    return { empty: true }
  }
  return JSON.parse(string)
}

class DDAtHome extends EventEmitter {
  constructor(url, { PING_INTERVAL = 1000 * 30, INTERVAL = 480, start = true, wsLimit = Infinity } = {}) {
    super()
    this.url = url
    this.PING_INTERVAL = PING_INTERVAL
    this.INTERVAL = INTERVAL
    this.stoped = false
    this.queryTable = new Map()
    this.wsLimit = wsLimit
    this.relay = relay(this)
    if (start) {
      this.start()
    }
  }

  connect() {
    const ws = new WebSocket(this.url)
    this.ws = ws
    return new Promise(resolve => {
      const processer = async ({ key, url }) => {
        const now = Date.now()
        this.emit('log', 'job received', url)
        this.emit('url', url)
        const time = Date.now()
        const opts = { headers: { Cookie: '_uuid=;rpdid=', 'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/105.0.5195.100 Mobile/15E148 Safari/604.1' } }
        const data = await fetch(url, opts).then(w => w.text()).catch(() => JSON.stringify({ code: 233 }))
        const result = this.secureSend(JSON.stringify({
          key,
          data
        }))
        if (result) {
          this.emit('done', now, Date.now() - time, url)
          this.emit('log', `job complete ${((Date.now() - time) / 1000).toFixed(2)}s`)
        }
      }

      ws.on('message', message => {
        const { key, data, empty, payload } = parse(message)
        if (payload) {
          this.emit('payload', payload)
        }
        if (empty) {
          this.emit('log', 'wait')
        } else if (data) {
          const { type, url, result } = data
          if (type === 'query') {
            if (this.queryTable.has(key)) {
              this.queryTable.get(key)(result)
              this.queryTable.delete(key)
            }
          } else if (type === 'http') {
            processer({ key, url })
          }
        }
      })

      const core = async () => {
        while (ws.readyState === 1) {
          this.secureSend('DDDhttp')
          await wait(this.INTERVAL)
        }
      }

      ws.on('open', async () => {
        this.emit('log', 'DD@Home connected')
        this.emit('open')
        core()

        let lastPong = Date.now()

        ws.on('pong', () => {
          this.emit('log', 'pong')
          lastPong = Date.now()
        })

        while (ws.readyState === 1) {
          ws.ping()
          await wait(this.PING_INTERVAL)
          if ((Date.now() - lastPong - this.PING_INTERVAL * 5) > 0) {
            this.emit('log', 'timeout')
            ws.close(4663, 'timeout')
          }
        }
      })

      ws.on('error', e => {
        console.error(`error: ${e.message}`)
      })

      ws.on('close', (n, reason) => {
        this.emit('log', `closed ${n}`)
        this.emit('close', n, reason)
        setTimeout(resolve, 1000)
      })
    })
  }

  secureSend(data) {
    if (this.ws.readyState === 1) {
      this.ws.send(data)
      return true
    }
  }

  ask(query) {
    return new Promise((resolve, reject) => {
      const key = String(Math.random())
      this.queryTable.set(key, resolve)
      this.secureSend(JSON.stringify({ key, query }))
      setTimeout(() => {
        if (this.queryTable.has(key)) {
          this.queryTable.delete(key)
          reject(new Error('timeout'))
        }
      }, 1000 * 5)
    })
  }

  stop() {
    this.stoped = true
    this.relay.emit('stop')
    if (this.ws.readyState === 1) {
      this.ws.close()
    }
  }

  async start() {
    this.relay.emit('start')
    while (!this.stoped) {
      await this.connect()
    }
  }
}

module.exports = DDAtHome
