[![logo-light-long-2](https://github.com/policer-io/.github/assets/16650977/c39ad4a3-7a5c-40b6-9a69-5be3a3c50255)](https://policer.io)

# Policy Center (API)

Manage, test and store your your permissions and access control logic with JSON, independent of your app's code, at a central place.

[![Pipeline](https://github.com/policer-io/api/actions/workflows/test.yml/badge.svg)](https://github.com/policer-io/api/actions/workflows/test.yml)
[![fastify](https://img.shields.io/static/v1?label=built+with&message=fastify&color=363636)](https://www.fastify.io/)
[![Docker](https://img.shields.io/static/v1?label=shipped+with&message=Docker&color=287cf9)](https://www.docker.com/)
[![embrio.tech](https://img.shields.io/static/v1?label=by&message=EMBRIO.tech&color=24ae5f)](https://embrio.tech)

## :star: Give us a Star!

### Support the project by giving it a GitHub Star!

[![GitHub Repo stars](https://img.shields.io/github/stars/policer-io/api?label=GitHub%20%E2%AD%90%EF%B8%8F)](https://github.com/policer-io/api)

## :gem: Key Benefits

[Learn more](https://policer.io/#features) about the benefits and features of policer.io!

## :construction: Work in Progress

**:warning: Not ready to be used in production yet!** [Sign up](https://policer.io/sign-up/) to get notified when ready.

## :seedling: Staging

The staging API and documentation is available at `tbd`

## :construction_worker: Development

We highly recommend to develop by using the main [policer.io repository](https://github.com/policer-io/policer-io). It allows to run all required services (frontend and backend) with [Docker Compose](https://docs.docker.com/compose/).

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

Talk to us via [policer.io](https://policer.io/contact/)

## License

The code is licensed under the [AGPLv3](/LICENSE) License.
