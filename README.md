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
  --interval=<time>  Interval to pull tasks (ms).
  --anonymous        Do not send platform info to the server.
  --nickname=<name>  Use a nickname. [env: NICKNAME]
  --verbose          Be more verbose. [env: VERBOSE]
```

#### ENV:

| ENV      | Default                  | Document                                                     |
| -------- | ------------------------ | ------------------------------------------------------------ |
| URL      | `wss://cluster.vtbs.moe` | Upstream URL                                                 |
| INTERVAL | `480`                    | Task interval in ms                                          |
| HIDE     | `false` *                | hide all extra information including platform, client version, Node.js runtime version, docker status ** |
| NICKNAME | `undefined`              | A optional nickname to display on statistics board (in progress). |
| Docker   | Depends                  | Is Docker environment?                                       |
| VERBOSE  | `false` *                | Verbose log                                                  |

\* giving any value will make it `true`

\*\* details see source code

## Contribution/Other information

The source code of backend (Cluster Manager) is available at <https://github.com/dd-center/Cluster-center>