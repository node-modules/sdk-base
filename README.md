sdk-base
---------------

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![node version][node-image]][node-url]
[![Gittip][gittip-image]][gittip-url]

[npm-image]: https://img.shields.io/npm/v/sdk-base.svg?style=flat-square
[npm-url]: https://npmjs.org/package/sdk-base
[travis-image]: https://img.shields.io/travis/node-modules/sdk-base.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/sdk-base
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.8-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[gittip-image]: https://img.shields.io/gittip/dead-horse.svg?style=flat-square
[gittip-url]: https://www.gittip.com/dead-horse/

a base class for sdk with default error handler.

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
