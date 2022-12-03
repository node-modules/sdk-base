sdk-base
---------------

[![NPM version][npm-image]][npm-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/sdk-base.svg?style=flat-square
[npm-url]: https://npmjs.org/package/sdk-base
[coveralls-image]: https://img.shields.io/coveralls/node-modules/sdk-base.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/node-modules/sdk-base?branch=master
[download-image]: https://img.shields.io/npm/dm/sdk-base.svg?style=flat-square
[download-url]: https://npmjs.org/package/sdk-base


A base class for sdk with some common & useful functions.

## Installation

```bash
$ npm install sdk-base
```

## Usage

Constructor argument:
- {Object} options
  - {String} [initMethod] - the async init method name, the method should be a function return promise. If set, will execute the function in the constructor.

  ```js
  const Base = require('sdk-base');

  class Client extends Base {
    constructor() {
      super({
        initMethod: 'init',
      });
    }

    async init() {
      // put your async init logic here
    }
    // support async function too
    // async init() {
    //   // put your async init logic here
    // }
  }

  (async function main() {
    const client = new Client();
    // wait client ready, if init failed, client will throw an error.
    await client.ready();

    // support async event listener
    client.on('data', async function (data) {
      // put your async process logic here
      //
      // @example
      // ----------
      // await submit(data);
    });

    client.emit('data', { foo: 'bar' });

  })().catch(err => { console.error(err); });
  ```

### API

- `.ready(flagOrFunction)` flagOrFunction is optional, and the argument type can be Boolean, Error or Function.

  ```js
  // init ready
  client.ready(true);
  // init failed
  client.ready(new Error('init failed'));

  // listen client ready
  client.ready(err => {
    if (err) {
      console.log('client init failed');
      console.error(err);
      return;
    }
    console.log('client is ready');
  });

  // support promise style call
  client.ready()
    .then(() => { ... })
    .catch(err => { ... });

  // support generator style call
  await client.ready();
  ```

- `.isReady getter` detect client start ready or not.
- `.on(event, listener)` wrap the [EventEmitter.prototype.on(event, listener)](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener), the only difference is to support adding async function listener on events, except 'error' event.
- `once(event, listener)` wrap the [EventEmitter.prototype.once(event, listener)](https://nodejs.org/api/events.html#events_emitter_once_eventname_listener), the only difference is to support adding async function listener on events, except 'error' event.
- `prependListener(event, listener)` wrap the [EventEmitter.prototype.prependListener(event, listener)](https://nodejs.org/api/events.html#events_emitter_prependlistener_eventname_listener), the only difference is to support adding async function listener on events, except 'error' event.
- `prependOnceListener(event, listener)` wrap the [EventEmitter.prototype.prependOnceListener(event, listener)](https://nodejs.org/api/events.html#events_emitter_prependoncelistener_eventname_listener), the only difference is to support adding generator listener on events, except 'error' event.
- `addListener(event, listener)` wrap the [EventEmitter.prototype.addListener(event, listener)](https://nodejs.org/api/events.html#events_emitter_addlistener_eventname_listener), the only difference is to support adding async function listener on events, except 'error' event.

  ```js
  client.on('data', async function(data) {
    // your async process logic here
  });
  client.once('foo', async function(bar) {
    // ...
  });

  // listen error event
  client.on('error', err => {
    console.error(err.stack);
  });
  ```

- `.await(event)`: [await an event](https://github.com/cojs/await-event), return a promise, and it will resolve(reject if event is `error`) once this event emmited.

  ```js
  const data = await client.await('data');
  ```

- `.awaitFirst(event)`: [await the first event in a set of event pairs](https://github.com/node-modules/await-first), return a promise, and it will clean up after itself.

  ```js
  (async function main() {
    const o = await client.awaitFirst([ 'foo', 'bar' ]);
    if (o.event === 'foo') {
      // ...
    }
    if (o.event === 'bar') {
      // ...
    }
  })();
  ```
  
- `._close()`: The `_close()` method is called by `close`, It can be overridden by child class, but should not be called directly. It must return promise or generator.

- `.close()`: The `close()` method is used to close the instance. 

### License

[MIT](LICENSE)
