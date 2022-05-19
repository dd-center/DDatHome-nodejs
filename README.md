# DDatHome nodejs ![Node CI](https://github.com/dd-center/DDatHome-nodejs/workflows/Core%20CI/badge.svg)
This is Node.js Client of Project ***DD@Home***.

Cluster Manager and Protocol: <https://github.com/dd-center/Cluster-center>

## Usage

Thank you for participating DD@Home!

### Download executable

<https://github.com/dd-center/DDatHome-nodejs/releases/latest>

### npx

You need to install Node.js at <https://nodejs.org/en/download/>

```sh
npx dd-center/DDatHome-nodejs
```

### Docker

Docker Hub: <https://hub.docker.com/r/simon300000/ddathome-nodejs>

#### Pull

```sh
docker pull simon300000/ddathome-nodejs
```

#### Run

```shell
docker run simon300000/ddathome-nodejs
```

#### Run in background

```shell
docker run -d simon300000/ddathome-nodejs
```

### Clone

You need to install Node.js at <https://nodejs.org/en/download/>

#### Install

```sh
git clone https://github.com/dd-center/DDatHome-nodejs.git
cd DDatHome-nodejs
npm install
```

#### Run

```shell
node index.js
```

#### Run with pm2

```shell
pm2 start ecosystem.config.js 
```

## Settings

Edit Settings by environment variables or by command line arguments.

#### CLI:

```
  --url=<URL>        URL to the websocket server.
                     [env: URL] [default: wss://cluster.vtbs.moe]
                     
  --interval=<time>  Interval to pull tasks (ms).
                     [env: INTERVAL] [default: 1280]

  --ws-limit=<limit> Limit of WebSocket connections to live.bilibili.com.
                     [env: LIMIT]

  --uuid=<uuid>      UUID for stats tracking.
                     [env: UUID]
                     
  --no-dns-cache     Disable DNS cache
                     [env: NO_DNS_CACHE]
                     
  --anonymous        Do not send platform info to the server.
                     [env: HIDE]
                     
  --nickname=<name>  Use a nickname. [env: NICKNAME]
  --verbose          Be more verbose. [env: VERBOSE]
```

#### ENV:

| ENV          | Default                  | Document                                                     |
| ------------ | ------------------------ | ------------------------------------------------------------ |
| URL          | `wss://cluster.vtbs.moe` | Upstream URL                                                 |
| INTERVAL     | `1280`                   | Task interval in ms                                          |
| LIMIT        | `Infinity`               | Live room relay WebSocket connections                        |
| UUID         | `undefined`              | stats tracking                                               |
| NO_DNS_CACHE | `false` *                | Disable internal DNS cache                                   |
| HIDE         | `false` *                | hide all extra information including platform, client version, Node.js runtime version, docker status ** |
| NICKNAME     | `undefined`              | A optional nickname to display on statistics board (in progress). |
| Docker       | Depends                  | Is Docker environment?                                       |
| VERBOSE      | `false` *                | Verbose log                                                  |

\* giving any value will make it `true`

\*\* details see source code

## Contribution/Other information

The source code of backend (Cluster Manager) is available at <https://github.com/dd-center/Cluster-center>