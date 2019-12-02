# rottencritic API

[![CircleCI](https://circleci.com/gh/Rottencritics/rottencritic-api/tree/master.svg?style=svg)](https://circleci.com/gh/Rottencritics/rottencritic-api/tree/master)
[![DeepScan grade](https://deepscan.io/api/teams/6338/projects/8295/branches/96187/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=6338&pid=8295&bid=96187)

## API Documentation

The API is documented under the resource `/api/doc`.
I.e. if the server is up and running on localhost you could find the
documentation at: http://localhost/api/doc

## Installation & Deployment

The easiest way to start a server for the rottencritic API is via Docker.
But first the project dependencies have to be installed: `yarn install`

### Enironment Setup

In order for the server to function a few environment variables must be set:

- `POSTGRES_DB` - The name of the database used.
- `POSTGRES_USER` - The name of the database user used.
- `POSTGRES_PASS` - The password of the database user used.
- `OMDB_API_KEY` - The API key used for connecting to [OMDb](http://www.omdbapi.com/).
- `TOKEN_SECRET` - A secret key used for generating tokens.

These can be set in a `.env`-file for example.

### Using Docker

To deploy the application via docker run:

```bash
yarn build && docker-compose up -d
```

### Local Development Server

The easiest way to deploy the application is via Docker,
but to start an application server simply run `yarn start`.
**NOTE:** This requires that a postgres database is installed and configured.

## Updating Database Schemas

In order for the database to be updated with new schemas while using Docker
the default data directory has to be emptied.
If the directory is not emptied, no sql scripts will be ran (unless manually).
