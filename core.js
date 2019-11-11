const WebSocket = require('ws')
const got = require('got')
const EventEmitter = require('events')

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const parse = string => {
  if (string === 'wait') {
    return { empty: true }
  }
  return JSON.parse(string)
}

class DDAtHome extends EventEmitter {
  constructor(url, { PARALLEL = 48, PING_INTERVAL = 1000 * 30, INTERVAL = 480, start = true } = {}) {
    super()
    this.url = url
    this.PARALLEL = PARALLEL
    this.PING_INTERVAL = PING_INTERVAL
    this.INTERVAL = INTERVAL
    this.stoped = false
    this.queryTable = new Map()
    if (start) {
      this.start()
    }
  }

  connect() {
    const ws = new WebSocket(this.url)
    this.ws = ws
    return new Promise(resolve => {
      const pending = []

      const processer = async () => {
        await wait(this.INTERVAL * this.PARALLEL * Math.random())
        while (ws.readyState === 1) {
          const now = Date.now()
          const pause = wait(this.INTERVAL * this.PARALLEL)
          const { key, url, empty } = await new Promise(resolve => {
            pending.push(resolve)
            this.secureSend('DDDhttp')
          })
          if (empty) {
            this.emit('log', 'wait')
          } else {
            this.emit('log', 'job received', url)
            this.emit('url', url)
            const time = Date.now()
            const { body } = await got(url).catch(e => ({ body: JSON.stringify({ code: e.statusCode }) }))
            const result = this.secureSend(JSON.stringify({
              key,
              data: body
            }))
            if (result) {
              this.emit('done', now, Date.now() - time, url)
              this.emit('log', `job complete ${((Date.now() - time) / 1000).toFixed(2)}s`, this.INTERVAL * this.PARALLEL - Date.now() + now)
            }
          }
          await pause
        }
      }

      ws.on('message', message => {
        const { key, data, empty } = parse(message)
        if (empty) {
          const resolve = pending.shift()
          if (resolve) {
            resolve({ empty })
          }
        } else if (data) {
          const { type, url, result } = data
          if (type === 'query') {
            if (this.queryTable.has(key)) {
              this.queryTable.get(key)(result)
              this.queryTable.delete(key)
            }
          } else if (type === 'http') {
            const resolve = pending.shift()
            if (resolve) {
              resolve({ key, url })
            }
          }
        }
      })

      ws.on('open', async () => {
        this.emit('log', 'DD@Home connected')
        this.emit('open')
        Array(this.PARALLEL).fill().map(processer)

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
          reject(new Error('timeout'))
        }
      }, 1000 * 5)
    })
  }

  stop() {
    this.stoped = true
    if (this.ws.readyState === 1) {
      this.ws.close()
    }
  }

  async start() {
    while (!this.stoped) {
      await this.connect()
    }
  }
}

module.exports = DDAtHome
