# Changelog

## [5.0.1](https://github.com/node-modules/sdk-base/compare/v5.0.0...v5.0.1) (2024-12-22)


### Bug Fixes

* allow sub class to override event methods ([#24](https://github.com/node-modules/sdk-base/issues/24)) ([d1ffb61](https://github.com/node-modules/sdk-base/commit/d1ffb61266aaec6028c39a6754671a555e41a6b7))

## [5.0.0](https://github.com/node-modules/sdk-base/compare/v4.2.1...v5.0.0) (2024-12-18)


### ⚠ BREAKING CHANGES

* drop Node.js < 18.19.0 support

part of https://github.com/eggjs/egg/issues/3644

https://github.com/eggjs/egg/issues/5257

### Features

* support cjs and esm both by tshy ([#23](https://github.com/node-modules/sdk-base/issues/23)) ([cde6773](https://github.com/node-modules/sdk-base/commit/cde67730c06f6b614c30853f6ddaf936b786ecbf))

## [4.2.1](https://github.com/node-modules/sdk-base/compare/v4.2.0...v4.2.1) (2022-12-17)


### Bug Fixes

* auto release on action ([#22](https://github.com/node-modules/sdk-base/issues/22)) ([e74df48](https://github.com/node-modules/sdk-base/commit/e74df4885a74fa99e935323a858e7f6c4447cc97))

---


4.2.0 / 2022-12-09
==================

**features**
  * [[`71d7ddd`](http://github.com/node-modules/sdk-base/commit/71d7ddd0c98f0c3c6ead65e1741ed5c54bd0eb38)] - 📦 NEW: Support localStorage getter (#21) (fengmk2 <<fengmk2@gmail.com>>)

4.1.0 / 2022-12-03
==================

**features**
  * [[`6e8a1c4`](http://github.com/node-modules/sdk-base/commit/6e8a1c4707908b28cc30a6019f164544c9033bb7)] - 📦 NEW: Support ready or timeout detect (#20) (fengmk2 <<fengmk2@gmail.com>>)

4.0.0 / 2022-12-03
==================

**features**
  * [[`567a380`](http://github.com/node-modules/sdk-base/commit/567a3806e348549f40fedf3438054b53f540107e)] - 👌 IMPROVE: [BREAKING] Drop Node.js < 14 support (#19) (fengmk2 <<fengmk2@gmail.com>>)
  * [[`07d55e8`](http://github.com/node-modules/sdk-base/commit/07d55e8596ced9ecaea837a3ff8a56e87a333da8)] - feat: optimize performance (#18) (brizer <<362512489@qq.com>>)

**others**
  * [[`e9bf6e9`](http://github.com/node-modules/sdk-base/commit/e9bf6e9e66570ac7c5e9537c22855573275d6618)] - refactor: enhance require profermance (#16) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)
  * [[`bbea174`](http://github.com/node-modules/sdk-base/commit/bbea174cebde7af79afdff50cd01eec3b5481fad)] - Create codeql.yml (fengmk2 <<fengmk2@gmail.com>>)

3.6.0 / 2019-04-24
==================

**features**
  * [[`39c0f1d`](http://github.com/node-modules/sdk-base/commit/39c0f1d946bd7da1e393d42cca2f5e1bc22eb785)] - feat: implement close function (#17) (killa <<killa123@126.com>>)

3.5.1 / 2018-09-27
==================

**fixes**
  * [[`de262c1`](http://github.com/node-modules/sdk-base/commit/de262c1e41e65a5fb11e95a95f96c6c561cb9d23)] - fix(ts): support es module export (#15) (Haoliang Gao <<sakura9515@gmail.com>>)

3.5.0 / 2018-07-26
==================

**features**
  * [[`dcce360`](http://github.com/node-modules/sdk-base/commit/dcce360d5da6a3f0516c2329c1902c49221ffd29)] - feat: add typescript definition file (#14) (Angela <<idu.angela@gmail.com>>)

**others**
  * [[`f975763`](http://github.com/node-modules/sdk-base/commit/f975763047a461fc8d0758f08dd52e16078f5bc9)] - chore: release 3.4.0 (xiaochen.gaoxc <<xiaochen.gaoxc@alibaba-inc.com>>),

3.4.0 / 2017-11-24
==================

**features**
  * [[`98207ba`]](https://github.com/node-modules/sdk-base/pull/11/commits/98207ba521487df39f7c9b116aaf7163bb6b9ad8) - feat: add awaitFirst api (#11) (gxcsoccer <<gxcsoccer@126.com>>)

3.3.0 / 2017-09-17
==================

**features**
  * [[`8d5c04a`](http://github.com/node-modules/sdk-base/commit/8d5c04aa3b0fee135dcf972b447aba0f79f56417)] - feat: add isReady getter (#10) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`6ec435f`](http://github.com/node-modules/sdk-base/commit/6ec435f676395726ff64646518b55c7c8ff4bc45)] - chore: fix initMethod document description (fengmk2 <<fengmk2@gmail.com>>)

3.2.0 / 2017-06-26
==================

  * feat: let options.initMethod support functions that return promise (#9)

3.1.1 / 2017-03-14
==================

  * fix: avoid duplicate error handler (#8)

3.1.0 / 2017-02-17
==================

  * feat: support client.await (#7)

3.0.1 / 2017-01-12
==================

  * fix: initMethod should be lazy executed (#6)

3.0.0 / 2017-01-12
==================

  * feat: [BREAKING_CHANGE] add ready with error and generator listener (#5)

2.0.1 / 2016-03-11
==================

  * fix: use event.listeners

2.0.0 / 2016-03-11
==================

  * refactor: listen on error synchronous

1.1.0 / 2015-11-14
==================

  * refactor: drop 0.8 support
  * feat: support ready(flagOrFunction)

1.0.1 / 2014-11-06
==================

  * remove .npmignore
  * add __filename, always show construct name
  * more pretty
  * refine error display
  * refactor(error): improve default error handler
  * fix travis
  * fix link
