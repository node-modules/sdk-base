const assert = require('assert');
const pedding = require('pedding');
const Base = require('..');
const path = require('path');
const runscript = require('runscript');
const { AsyncLocalStorage } = require('async_hooks');
const baseDir = path.join(__dirname, './fixtures/ts');

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe('test/index.test.js', () => {
  class SomeServiceClient extends Base {}

  describe('default error handler', () => {
    it('should auto add the default error handler and show error message', () => {
      const c = new SomeServiceClient();
      assert(c.listeners('error').length === 1);
      const err = new Error('mock error 1');
      err.data = { foo: 'bar', url: '/foo' };
      err.status = 500;
      err.type = 'DUMP';
      c.emit('error', err);
      // should stderr output
      // [Thu Nov 06 2014 11:14:33 GMT+0800 (CST)] ERROR 63189 [sdk-base] Unhandle SomeServiceClientError: mock error 1, stack:
      // Error: mock error 1
      //     at null._onTimeout (/Users/mk2/git/sdk-base/test/index.test.js:29:19)
      //     at Timer.listOnTimeout (timers.js:133:15)
      // { [SomeServiceClientError: mock error 1]
      //   data: { foo: 'bar', url: '/foo' },
      //   name: 'SomeServiceClientError' }
    });

    it('should not change the error name and show error message', done => {
      const c = new SomeServiceClient();
      setTimeout(function() {
        assert(c.listeners('error').length === 1);
        const err = new Error('mock some error');
        err.name = 'SomeApiError';
        c.emit('error', err);
        // should stderr output
        // [Thu Nov 06 2014 11:14:33 GMT+0800 (CST)] ERROR 63189 [sdk-base] Unhandle SomeApiError: mock some error, stack:
        // Error: mock some error
        //     at null._onTimeout (/Users/mk2/git/sdk-base/test/index.test.js:29:19)
        //     at Timer.listOnTimeout (timers.js:133:15)
        // { [SomeApiError: mock some error]
        //   name: 'SomeApiError' }
        done();
      }, 10);
    });
  });

  describe('custom error handler and do not show error message', () => {
    it('should use the exists error handler', done => {
      const c = new SomeServiceClient();
      c.on('error', function(err) {
        assert(err.message === 'mock error 2');
        done();
      });
      assert(c.listeners('error').length === 2);
      c.emit('error', new Error('mock error 2'));
      // should not stderr output
    });
  });

  describe('ready', () => {
    it('should ready once', done => {
      const client = new SomeServiceClient();
      assert(client.isReady === false);
      client.ready(() => {
        assert(client.isReady === true);
        done();
      });
      client.ready(true);
      assert(client.isReady === true);
      // again should work
      client.ready(true);
      assert(client.isReady === true);
    });
  });

  describe('options.initMethod support generator', () => {
    class Client extends Base {
      constructor(options) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      * init() {
        assert(this.foo === 'foo');
        yield cb => setTimeout(cb, 500);
        this.foo = 'bar';
      }
    }

    class Client2 extends Base {
      constructor(options) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      init() {
        assert(this.foo === 'foo');
        this.foo = 'bar';
        return Promise.resolve();
      }
    }

    it('should auto init with options.initMethod', function* () {
      const client = new Client({ a: 'a' });
      assert.deepEqual(client.options, {
        a: 'a',
        initMethod: 'init',
      });
      yield client.ready();
      yield client.ready();
      assert(client.foo === 'bar');
      assert(client.localStorage === undefined);
    });

    it('should trigger ready callback without err', done => {
      const client = new Client();
      client.ready(err => {
        assert.ifError(err);
        done();
      });
    });

    it('should support options.initMethod that return promise', function* () {
      const client = new Client2({ a: 'a' });
      assert.deepEqual(client.options, {
        a: 'a',
        initMethod: 'init',
      });
      yield client.ready();
      yield client.ready();
      assert(client.foo === 'bar');
    });
  });

  describe('options.initMethod support async function', () => {
    class Client extends Base {
      constructor(options) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      async init() {
        assert(this.foo === 'foo');
        await sleep(500);
        this.foo = 'bar';
      }
    }

    class Client2 extends Base {
      constructor(options) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      async init() {
        assert(this.foo === 'foo');
        await sleep(500);
        throw new Error('mock init error');
      }
    }

    class Client3 extends Base {
      constructor(options) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      async init() {
        assert(this.foo === 'foo');
        await sleep(500);
        throw new Error('mock ready error');
      }
    }

    it('should auto init with options.initMethod', async () => {
      const localStorage = new AsyncLocalStorage();
      const client = new Client({ a: 'a', localStorage });
      assert(client.options.initMethod === 'init');
      assert(client.isReady === false);
      await client.ready();
      assert(client.localStorage.getStore() === undefined);
      await client.localStorage.run({ foo: 'bar' }, async () => {
        assert(client.localStorage.getStore().foo === 'bar');
      });
      await client.ready();
      assert(client.isReady === true);
      assert(client.foo === 'bar');
    });

    it('should trigger ready callback without err', done => {
      const client = new Client();
      client.ready(err => {
        assert.ifError(err);
        done();
      });
    });

    it('should throw init error', async () => {
      const client = new Client2({ a: 'a' });
      assert.deepEqual(client.options, {
        a: 'a',
        initMethod: 'init',
      });
      await assert.rejects(async () => {
        await client.ready();
      }, err => {
        assert(err.message === 'mock init error');
        return true;
      });
    });

    it('should throw ready error', async () => {
      const client = new Client3({ a: 'a' });
      assert.deepEqual(client.options, {
        a: 'a',
        initMethod: 'init',
      });
      await assert.rejects(async () => {
        await client.ready();
      }, err => {
        assert(err.message === 'mock ready error');
        return true;
      });

      await assert.rejects(async () => {
        await client.readyOrTimeout(10);
      }, err => {
        assert(err.message === 'mock ready error');
        return true;
      });
    });
  });

  describe('readyOrTimeout()', () => {
    class Client extends Base {
      constructor(options) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      async init() {
        assert(this.foo === 'foo');
        await sleep(500);
        this.foo = 'bar';
      }
    }

    class Client2 extends Base {
      constructor(options) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      async init() {
        assert(this.foo === 'foo');
        await sleep(500);
        throw new Error('mock ready error');
      }
    }

    it('should ready timeout', async () => {
      const client = new Client({ a: 'a' });
      await sleep(1);
      assert.deepEqual(client.options, {
        a: 'a',
        initMethod: 'init',
      });
      await assert.rejects(async () => {
        await client.readyOrTimeout(10);
      }, err => {
        assert(err.name === 'TimeoutError');
        // console.log('%o', client._readyCallbacks);
        // console.log(client._readyCallbacks[0].toString());
        assert(client._readyCallbacks.length === 0);
        return true;
      });

      let readySuccess = false;
      client.ready(function readySuccessCallback() {
        readySuccess = true;
      });
      await assert.rejects(async () => {
        await client.readyOrTimeout(10);
      }, err => {
        assert(err.name === 'TimeoutError');
        console.log('%o', client._readyCallbacks);
        // console.log(client._readyCallbacks[0].toString());
        assert(client._readyCallbacks.length === 1);
        assert(client._readyCallbacks[0].name === 'readySuccessCallback');
        return true;
      });
      await client.ready();
      assert(readySuccess);

      await client.readyOrTimeout(1);
    });

    it('should ready success', async () => {
      const client = new Client({ a: 'a' });
      assert.deepEqual(client.options, {
        a: 'a',
        initMethod: 'init',
      });
      await client.readyOrTimeout(510);
    });

    it('should ready error', async () => {
      const client = new Client2({ a: 'a' });
      assert.deepEqual(client.options, {
        a: 'a',
        initMethod: 'init',
      });
      await assert.rejects(async () => {
        await client.readyOrTimeout(510);
      }, err => {
        assert(err.message === 'mock ready error');
        return true;
      });
    });
  });

  describe('this.ready(err)', () => {
    class ErrorClient extends Base {
      constructor() {
        super({
          initMethod: 'init',
        });
      }

      * init() {
        yield cb => setTimeout(() => {
          cb(new Error('init error'));
        }, 500);
      }
    }

    it('should ready failed', function* () {
      const client = new ErrorClient();
      let initError = null;
      try {
        yield client.ready();
      } catch (err) {
        initError = err;
      }
      assert(initError && initError.message === 'init error');

      initError = null;
      try {
        yield client.ready();
      } catch (err) {
        initError = err;
      }
      assert(initError && initError.message === 'init error');
    });

    it('should trigger ready callback with err', done => {
      const client = new ErrorClient();
      client.ready(err => {
        assert(err && err.message === 'init error');
        done();
      });
    });

    it('should emit error if ready failed', done => {
      const client = new ErrorClient();
      client.once('error', err => {
        assert(err.message === 'init error');
        done();
      });
    });

    it('should not emit error event if readyCallback not empty', done => {
      const client = new ErrorClient();
      client.ready(err => {
        assert(err.message === 'init error');
        setImmediate(done);
      });
      client.once('error', () => {
        done(new Error('should not run here'));
      });
    });
  });

  describe('generator event listener', () => {
    it('should add generator listener', done => {
      done = pedding(done, 8);
      const client = new SomeServiceClient();

      client.addListener('event_code', function* (a, b) {
        console.log('event_code in addListener');
        assert(a === 1);
        assert(b === 2);
        done();
      });

      client.on('event_code', function* (a, b) {
        console.log('event_code in on');
        assert(a === 1);
        assert(b === 2);
        done();
      });

      client.once('event_code', function* (a, b) {
        console.log('event_code in once');
        assert(a === 1);
        assert(b === 2);
        done();
      });

      client.prependListener('event_code', function* (a, b) {
        console.log('event_code in prependListener');
        assert(a === 1);
        assert(b === 2);
        done();
      });

      client.prependOnceListener('event_code', function* (a, b) {
        console.log('event_code in prependOnceListener');
        assert(a === 1);
        assert(b === 2);
        done();
      });

      client.emit('event_code', 1, 2);
      client.emit('event_code', 1, 2);
    });

    it('should catch generator exception and emit on error event', done => {
      done = pedding(done, 2);
      const client = new SomeServiceClient();
      client.on('error', err => {
        assert(err.name === 'EventListenerProcessError');
        assert(err.message === 'generator process exception');
        done();
      });

      client.on('event_code', function* () {
        throw new Error('generator process exception');
      });

      client.once('event_code', function* () {
        throw new Error('generator process exception');
      });

      client.emit('event_code');
    });

    it('should remove generator listener', done => {
      const client = new SomeServiceClient();
      const handler = function* (data) {
        assert(data === 1);
        done();
      };
      client.on('event_code', data => {
        assert(data === 1);
        console.log('normal listener');
      });
      client.on('event_code', handler);
      client.emit('event_code', 1);
      client.removeListener('event_code', handler);
      assert(client.listeners('event_code').length === 0);
    });

    it('should not allow to add generator listener on error event', () => {
      const client = new SomeServiceClient();
      assert.throws(() => {
        client.on('error', function* (err) {
          console.error(err);
        });
      }, null, /\[sdk-base\] `error` event should not have a generator listener\./);
    });
  });

  describe('await && awaitFirst', () => {
    it('should support client.await', function* () {
      const client = new SomeServiceClient();
      setTimeout(() => client.emit('someEvent', 'foo'), 100);
      const res = yield client.await('someEvent');
      assert(res === 'foo');
    });

    it('should support client.awaitFirst', function* () {
      const client = new SomeServiceClient();
      setTimeout(() => client.emit('foo', 'foo'), 200);
      setTimeout(() => client.emit('bar', 'bar'), 100);

      const o = yield client.awaitFirst([ 'foo', 'bar' ]);
      assert.deepEqual(o, {
        event: 'bar',
        args: [ 'bar' ],
      });
      assert(client.listenerCount('foo') === 0);
      assert(client.listenerCount('bar') === 0);
    });
  });

  describe('run as typescript', () => {
    it('compile ts file and execute', async () => {
      await runscript(`tsc -p ${baseDir}/tsconfig.json`, { cwd: baseDir });
      const { test } = require('./fixtures/ts/index');
      const result = await test();
      assert.strictEqual(result, true);
    });
  });

  describe('close', () => {
    describe('generate close', () => {
      class GenerateCloseClient extends Base {
        * _close() {
          yield cb => process.nextTick(() => {
            cb();
          });
        }
      }

      it('should success', function* () {
        const client = new GenerateCloseClient();
        yield client.close();
        assert(client._closed === true);
      });
    });

    describe('promise close', () => {
      class PromiseCloseClient extends Base {
        _close() {
          return new Promise(resolve => {
            process.nextTick(() => {
              resolve();
            });
          });
        }
      }

      it('should success', function* () {
        const client = new PromiseCloseClient();
        yield client.close();
        assert(client._closed === true);
      });
    });

    describe('async function _close', () => {
      class PromiseCloseClient extends Base {
        async _close() {
          await sleep(10);
        }
      }

      it('should success', async () => {
        const client = new PromiseCloseClient();
        await client.close();
        assert(client._closed === true);
        await client.close();
        assert(client._closed === true);
      });
    });

    describe('no _close', () => {
      class NoCloseClient extends Base {
      }

      it('should success', function* () {
        const client = new NoCloseClient();
        yield client.close();
        assert(client._closed === true);
      });
    });

    describe('duplicate close', () => {
      let calledTimes = 0;
      afterEach(() => {
        calledTimes = 0;
      });

      class PromiseCloseClient extends Base {
        _close() {
          calledTimes++;
          return new Promise(resolve => {
            process.nextTick(() => {
              resolve();
            });
          });
        }
      }

      describe('serial close', () => {
        it('should success', function* () {
          const client = new PromiseCloseClient();
          yield client.close();
          yield client.close();
          assert(client._closed === true);
          assert(calledTimes === 1);
        });
      });

      describe('parallel close', () => {
        it('should success', function* () {
          const client = new PromiseCloseClient();
          yield [
            client.close(),
            client.close(),
          ];
          assert(client._closed === true);
          assert(calledTimes === 1);
        });
      });
    });

    describe('error close', () => {
      class ErrorCloseClient extends Base {
        _close() {
          return new Promise((resolve, reject) => {
            reject(new Error('mock error'));
          });
        }
      }

      it('should success', function* () {
        const client = new ErrorCloseClient();
        let error;
        client.on('error', e => {
          error = e;
        });
        yield client.close();
        assert(client._closed === true);
        assert(error);
        assert(/mock error/.test(error.message));
      });
    });
  });
});
