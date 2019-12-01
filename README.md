# rottencritic API

[![CircleCI](https://circleci.com/gh/Rottencritics/rottencritic-api/tree/master.svg?style=svg)](https://circleci.com/gh/Rottencritics/rottencritic-api/tree/master)

## Running

Start the server by running `yarn start`.

### Docker

Start the docker instance by running:

`docker-compose up -d`

#### Environment

To launch the docker some environment variables are required to be set:

- POSTGRES_DB: Name of the database.
- POSTGRES_USER: Name of the database user.
- POSTGRES_PASS: Database user's password.

.env must be filled.

```
yarn build
docker-compose up -d --build
docker-compose down
sudo rm -rf postgres-data/
```

