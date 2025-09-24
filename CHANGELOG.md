## [0.1.5-alpha.0](https://github.com/policer-io/api/compare/v0.1.4-alpha.0...v0.1.5-alpha.0) (2025-09-24)

### Bug Fixes

* update axios to patch vulnerability ([867d416](https://github.com/policer-io/api/commit/867d41606f8aab6f4d8c2aef9e54b22fd9b00329))
* update mongoose to patch vulnerability ([645bd38](https://github.com/policer-io/api/commit/645bd3825a72fa6f01f8e6513e9008665301e289))
* update pdp-ts to patch vulnerabilities ([e671ca8](https://github.com/policer-io/api/commit/e671ca81f6d3279500d8fea7f08c4c4ce0992341))
## [0.1.4-alpha.0](https://github.com/policer-io/api/compare/v0.1.3-alpha.0...v0.1.4-alpha.0) (2024-12-04)
## [0.1.3-alpha.0](https://git.embrio.tech:2224/embrio/policer/api/compare/v0.1.2-alpha.0...v0.1.3-alpha.0) (2024-12-04)
## [0.1.2-alpha.0](https://git.embrio.tech:2224/embrio/policer/api/compare/v0.1.1-alpha.0...v0.1.2-alpha.0) (2024-07-19)

### Bug Fixes

* add missing production dependency ([e4d7a69](https://git.embrio.tech:2224/embrio/policer/api/commit/e4d7a696364d716003d56db47062c74c0802701b))
## [0.1.1-alpha.0](https://git.embrio.tech:2224/embrio/policer/api/compare/v0.1.0-alpha.0...v0.1.1-alpha.0) (2024-07-19)

### Bug Fixes

* remove unused env variables ([ef80be9](https://git.embrio.tech:2224/embrio/policer/api/commit/ef80be969fe3129aeeec78446519fbf9454a7950))
## 0.1.0-alpha.0 (2024-07-19)

### Features

* add application model and routes ([e3f9997](https://git.embrio.tech:2224/embrio/policer/api/commit/e3f99978403861fb816e7aebcb8a888b30b50db1))
* add logic model and routes ([83249b3](https://git.embrio.tech:2224/embrio/policer/api/commit/83249b359252b5e43a8c164afa0a37421d04cfa0))
* add permission model and routes and options for applications ([5aa6163](https://git.embrio.tech:2224/embrio/policer/api/commit/5aa61637b9513315e6c081170a516aee3f93a0c7))
* add role model and enpoints ([75d23aa](https://git.embrio.tech:2224/embrio/policer/api/commit/75d23aa95d8e776d0cbcb90d54030f329220375f))
* deliver entire appplication policy ([9552094](https://git.embrio.tech:2224/embrio/policer/api/commit/95520940febcc28bb002a2307c3aa49e5445e6c6))
* emit policy update events using socket.io ([387c661](https://git.embrio.tech:2224/embrio/policer/api/commit/387c66100d7232e764c158f0e42d136435ca9893))
* implement api access control ([f7f280d](https://git.embrio.tech:2224/embrio/policer/api/commit/f7f280dcb366ef22d1b7d59d8baf4e67063ab3fe))
* implement new policer logo and ci ([30b865a](https://git.embrio.tech:2224/embrio/policer/api/commit/30b865a78d95fa6fecc7c9ae1d7025bbbc08883a))
* log changes for audit trail ([8955f5d](https://git.embrio.tech:2224/embrio/policer/api/commit/8955f5d9c2de7baa1212a5d5e1a8d6389b7e9f47))
* prepare access control ([460ccb2](https://git.embrio.tech:2224/embrio/policer/api/commit/460ccb2fb04123a962dc6952e3a6a65cd8666500))
* separate policies by tenant and applications ([cae8e2b](https://git.embrio.tech:2224/embrio/policer/api/commit/cae8e2bc5a460ad4916e6eaf81bd474970e4b5e5))
* setup api routes and docs ([a495ac8](https://git.embrio.tech:2224/embrio/policer/api/commit/a495ac8d3de62c94e81866a501e29550a2be48a0))
* support setter logic for permissions ([29c21f8](https://git.embrio.tech:2224/embrio/policer/api/commit/29c21f8932b294110abd9356ceaa938f26db4d0e))
* use role name to reference inherits ([5868cf9](https://git.embrio.tech:2224/embrio/policer/api/commit/5868cf94216d55c0d5b6c3bc9b3d853c62e5083a))

### Bug Fixes

* do not expose root path in prod ([bd0bd55](https://git.embrio.tech:2224/embrio/policer/api/commit/bd0bd55f619bdc89534b2b96d8be1d5f7be26278))
* do not require auth for policy read requests ([8ae5827](https://git.embrio.tech:2224/embrio/policer/api/commit/8ae5827c107266035b5f9203fd3777eb4733b979))
* emit promulgator events only if no errors ([3cbcd9e](https://git.embrio.tech:2224/embrio/policer/api/commit/3cbcd9eb7e85d2618830bae9020516ce42e7f5a6))
* improve policy typing ([2c50a75](https://git.embrio.tech:2224/embrio/policer/api/commit/2c50a7510d1aa6b7aa641eae9f639b877f13329b))
* read tenant from header ([76e34c0](https://git.embrio.tech:2224/embrio/policer/api/commit/76e34c0574242bd57582e3802a813f35e891b93a))
