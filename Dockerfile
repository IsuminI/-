FROM node

RUN mkdir -p /app
WORKDIR /app
ADD . /app/

COPY package.json ./

RUN npm install

COPY ./ ./

CMD [ "node", "index.js"]