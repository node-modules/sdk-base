sdk-base
---------------

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/sdk-base.svg?style=flat-square
[npm-url]: https://npmjs.org/package/sdk-base
[travis-image]: https://img.shields.io/travis/node-modules/sdk-base.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/sdk-base
[coveralls-image]: https://img.shields.io/coveralls/node-modules/sdk-base.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/node-modules/sdk-base?branch=master
[gittip-image]: https://img.shields.io/gittip/dead-horse.svg?style=flat-square
[gittip-url]: https://www.gittip.com/dead-horse/
[david-image]: https://img.shields.io/david/node-modules/sdk-base.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/sdk-base
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.8-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/sdk-base.svg?style=flat-square
[download-url]: https://npmjs.org/package/sdk-base


A base class for sdk with default error handler.

## Installation

```bash
$ npm install sdk-base
```

## Usage

```js
var Base = require('sdk-base');
var util = require('util');

function Client() {
  Base.call(this);
}

util.inherits(Client, Base);
```

### License

MIT
