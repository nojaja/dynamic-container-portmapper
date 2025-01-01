FROM node:11.13.0-alpine

WORKDIR /

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["node", "./src/index.js"]
