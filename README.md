# Policer API

[![GitLab Status](https://git.embrio.tech/embrio/policer/api/badges/main/pipeline.svg)](https://git.embrio.tech/embrio/policer/api/pipelines)
[![fastify](https://img.shields.io/static/v1?label=built+with&message=fastify&color=363636)](https://www.fastify.io/)
[![Docker](https://img.shields.io/static/v1?label=shipped+with&message=Docker&color=287cf9)](https://www.docker.com/)
[![embrio.tech](https://img.shields.io/static/v1?label=by&message=EMBRIO.tech&color=24ae5f)](https://embrio.tech)

An API service to interact with Policer.

## :seedling: Staging

The staging API and documentation is available at `tbd`

## :construction_worker: Development

We highly recommend to develop using the overarching embrio/policer/development> repository. It allows to run all required services (frontend and backend) with [Docker Compose](https://docs.docker.com/compose/).

If you prefer to run this service without Docker the following instructions get you started.

### Prerequisites

- [Node Version Manager](https://github.com/nvm-sh/nvm)
  - node: version specified in [`.nvmrc`](/.nvmrc)
- [Yarn](https://classic.yarnpkg.com/en/)
- Development environment variables file

  - Copy the template with

        cp sample.env .env

### Install

    yarn install

### Run

    yarn develop

### Access

The service can be accessed under http://localhost:5000 or the `PORT` specified in the `.env` file.

### Commit

This repository uses commitlint to enforce commit message conventions. You have to specify the type of the commit in your commit message. Use one of the [supported types](https://github.com/pvdlg/conventional-changelog-metahub#commit-types).

    git commit -m "[type]: foo bar"

## Contact

[EMBRIO.tech](https://embrio.tech)  
[hello@embrio.tech](mailto:hello@embrio.tech)  
+41 44 797 59 16

## License

unlicensed
