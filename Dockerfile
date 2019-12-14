FROM node:13-alpine

RUN apk --no-cache add --virtual builds-deps build-base python

WORKDIR /app

# Install dependencies
COPY package.json /app
# To allow running without deamon
RUN yarn global add nodemon
RUN yarn

# We need to rebuild our binaries to make bcrypt work. This is not something
# that can currently be done in yarn, but rebuilding with `--update-binary`
# from npm should not affect yarn.
# See discussion in:
# https://github.com/yarnpkg/yarn/issues/2069
RUN npm rebuild --update-binary

# Build app source
COPY . /app
RUN yarn build

EXPOSE 8080

CMD [ "nodemon", "dist/app.js" ]
