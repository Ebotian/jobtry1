FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx playwright install --with-deps

EXPOSE 5000

CMD ["node", "server.js"]