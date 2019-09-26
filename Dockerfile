FROM node:alpine
WORKDIR /usr/src/app

ENV docker docker

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD [ "node", "index.js" ]
