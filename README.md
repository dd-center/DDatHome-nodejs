# DDatHome nodejs
This is Node.js Client of Project ***DD@Home***.

Cluster Manager and Protocol: <https://github.com/dd-center/Cluster-center>

## Usage

Thank you for participating DD@Home!

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

Edit Settings by environment variables.

| ENV      | Default                  | Document                                                     |
| -------- | ------------------------ | ------------------------------------------------------------ |
| url      | `wss://cluster.vtbs.moe` | Upstream URL                                                 |
| interval | `480`                    | Task interval in ms                                          |
| hide     | `false` *                | hide all extra information including platform, client version, Node.js runtime version, docker status ** |
| nickname | `undefined`              | A optional nickname to display on statistics board (in progress). |
| Docker   | Depends                  | Is Docker environment?                                       |
| verbose  | `false` *                | Verbose log                                                  |

\* giving any value will make it `true`

\*\* details see source code

## Contribution/Other information

The source code of backend (Cluster Manager) is available at <https://github.com/dd-center/Cluster-center>