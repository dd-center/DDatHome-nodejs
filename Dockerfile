FROM node:alpine
WORKDIR /usr/src/app

ENV docker docker

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index.js" ]
