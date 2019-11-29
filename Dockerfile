FROM node:10

WORKDIR /app
COPY package.json .
RUN yarn install

COPY . .

EXPOSE 8080

RUN yarn global add nodemon
RUN yarn build

CMD [ "nodemon", "dist/app.js" ]
