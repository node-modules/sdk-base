import { strict as assert } from 'node:assert';
import { AsyncLocalStorage } from 'node:async_hooks';
import { scheduler } from 'node:timers/promises';
import { Base, BaseOptions } from '../src/index.js';

describe('test/index.test.ts', () => {
  class SomeServiceClient extends Base {}

  class SomeServiceClient2 extends Base {
    protected _lists: any[] = [];

    on(...args: any[]) {
      this._lists.push(args);
      super.on(args[0], args[1]);
      return this;
    }
  }

  describe('default error handler', () => {
    it('should allow subclass to override on methods', () => {
      const c = new SomeServiceClient2();
      c.on('error', () => {});
      assert.equal(c.listeners('error').length, 2);
    });

    it('should auto add the default error handler and show error message', () => {
      const c = new SomeServiceClient();
      assert.equal(c.listeners('error').length, 1);
      const err: any = new Error('mock error 1');
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
        assert.equal(c.listeners('error').length, 1);
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
        assert.equal(err.message, 'mock error 2');
        done();
      });
      assert.equal(c.listeners('error').length, 2);
      c.emit('error', new Error('mock error 2'));
      // should not stderr output
    });
  });

  describe('ready', () => {
    it('should ready once', done => {
      const client = new SomeServiceClient();
      assert.equal(client.isReady, false);
      client.ready(() => {
        assert.equal(client.isReady, true);
        done();
      });
      client.ready(true);
      assert.equal(client.isReady, true);
      // again should work
      client.ready(true);
      assert.equal(client.isReady, true);
    });
  });

  describe('options.initMethod throw error when it is generator function', () => {
    class Client extends Base {
      constructor(options: BaseOptions) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
      }

      * init() {
        // ignore
      }
    }

    it('should trigger ready callback without err', () => {
      assert.throws(() => {
        new Client({});
      }, /\[sdk-base] this.init should not be generator function/);
    });
  });

  describe('options.initMethod support async function', () => {
    class Client extends Base {
      foo: string;

      constructor(options?: BaseOptions) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      async init() {
        assert.equal(this.foo, 'foo');
        await scheduler.wait(500);
        this.foo = 'bar';
      }
    }

    class Client2 extends Base {
      foo: string;

      constructor(options: BaseOptions & { foo?: string }) {
        super({
          initMethod: 'init',
          ...options,
        });
        this.foo = 'foo';
      }

      async init() {
        assert.equal(this.foo, 'foo');
        await scheduler.wait(500);
        throw new Error('mock init error');
      }
    }

    class Client3 extends Base {
      foo: string;
      constructor(options: BaseOptions & { a?: string; }) {
        super({
          initMethod: 'init',
          ...options,
        });
        this.foo = 'foo';
      }

      async init() {
        assert.equal(this.foo, 'foo');
        await scheduler.wait(500);
        throw new Error('mock ready error');
      }
    }

    it('should auto init with options.initMethod', async () => {
      const localStorage = new AsyncLocalStorage();
      const client = new Client({ a: 'a', localStorage });
      assert.equal(client.options.initMethod, 'init');
      assert.equal(client.isReady, false);
      await client.ready();
      assert.equal(client.localStorage.getStore(), undefined);
      await client.localStorage.run({ foo: 'bar' }, async () => {
        assert.equal(client.localStorage.getStore().foo, 'bar');
      });
      await client.ready();
      assert.equal(client.isReady, true);
      assert.equal(client.foo, 'bar');
    });

    it('should get default als from gals', async () => {
      const client = new Client({ a: 'a' });
      assert.equal(client.options.initMethod, 'init');
      assert.equal(client.isReady, false);
      await client.ready();
      assert.equal(client.localStorage.getStore(), undefined);
      await client.localStorage.run({ foo: 'bar' }, async () => {
        assert.equal(client.localStorage.getStore().foo, 'bar');
      });
      await client.ready();
      assert.equal(client.isReady, true);
      assert.equal(client.foo, 'bar');
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
        assert(err instanceof Error);
        assert.equal(err.message, 'mock init error');
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
        assert(err instanceof Error);
        assert(err.message === 'mock ready error');
        return true;
      });

      await assert.rejects(async () => {
        await client.readyOrTimeout(10);
      }, err => {
        assert(err instanceof Error);
        assert.equal(err.message, 'mock ready error');
        return true;
      });
    });
  });

  describe('readyOrTimeout()', () => {
    class Client extends Base {
      foo: string;
      constructor(options: BaseOptions) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      async init() {
        assert(this.foo === 'foo');
        await scheduler.wait(500);
        this.foo = 'bar';
      }
    }

    class Client2 extends Base {
      foo: string;
      constructor(options: BaseOptions) {
        super(Object.assign({
          initMethod: 'init',
        }, options));
        this.foo = 'foo';
      }

      async init() {
        assert.equal(this.foo, 'foo');
        await scheduler.wait(500);
        throw new Error('mock ready error');
      }
    }

    it('should ready timeout', async () => {
      const client = new Client({ a: 'a' });
      await scheduler.wait(1);
      assert.deepEqual(client.options, {
        a: 'a',
        initMethod: 'init',
      });
      await assert.rejects(async () => {
        await client.readyOrTimeout(10);
      }, err => {
        assert(err instanceof Error);
        assert.equal(err.name, 'TimeoutError');
        assert.equal(err.message, 'Timed out after 10ms');
        return true;
      });

      let readySuccess = false;
      client.ready(function readySuccessCallback() {
        readySuccess = true;
      });
      await assert.rejects(async () => {
        await client.readyOrTimeout(10);
      }, err => {
        assert(err instanceof Error);
        assert.equal(err.name, 'TimeoutError');
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
        assert(err instanceof Error);
        assert.equal(err.message, 'mock ready error');
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

      async init() {
        await scheduler.wait(500);
        throw new Error('init error');
      }
    }

    it('should ready failed', async () => {
      const client = new ErrorClient();
      await assert.rejects(async () => {
        await client.ready();
      }, err => {
        assert(err instanceof Error);
        assert.equal(err.message, 'init error');
        return true;
      });

      await assert.rejects(async () => {
        await client.ready();
      }, err => {
        assert(err instanceof Error);
        assert.equal(err.message, 'init error');
        return true;
      });
    });

    it('should trigger ready callback with err', done => {
      const client = new ErrorClient();
      client.ready(err => {
        assert(err instanceof Error);
        assert.equal(err.message, 'init error');
        done();
      });
    });

    it('should emit error if ready failed', done => {
      const client = new ErrorClient();
      client.once('error', err => {
        assert.equal(err.message, 'init error');
        done();
      });
      console.error('listen error');
    });

    it('should not emit error event if readyCallback not empty', done => {
      const client = new ErrorClient();
      client.ready(err => {
        assert(err instanceof Error);
        assert.equal(err.message, 'init error');
        setImmediate(done);
      });
      client.once('error', () => {
        done(new Error('should not run here'));
      });
    });
  });

  function padding(cb: () => void, count: number) {
    return () => {
      count--;
      if (count === 0) {
        cb();
      }
    };
  }

  describe('generator event listener', () => {
    it('should add generator listener', done => {
      done = padding(done, 8);
      const client = new SomeServiceClient();

      client.addListener('event_code', (a, b) => {
        console.log('event_code in addListener');
        assert.equal(a, 1);
        assert.equal(b, 2);
        done();
      });

      client.on('event_code', (a, b) => {
        console.log('event_code in on');
        assert(a === 1);
        assert(b === 2);
        done();
      });

      client.once('event_code', (a, b) => {
        console.log('event_code in once');
        assert(a === 1);
        assert(b === 2);
        done();
      });

      client.prependListener('event_code', (a, b) => {
        console.log('event_code in prependListener');
        assert(a === 1);
        assert(b === 2);
        done();
      });

      client.prependOnceListener('event_code', (a, b) => {
        console.log('event_code in prependOnceListener');
        assert(a === 1);
        assert(b === 2);
        done();
      });

      client.emit('event_code', 1, 2);
      client.emit('event_code', 1, 2);
    });

    // Don't catch event listener inside error
    // it('should catch generator exception and emit on error event', done => {
    //   done = padding(done, 2);
    //   const client = new SomeServiceClient();
    //   client.on('error', err => {
    //     assert(err.name === 'EventListenerProcessError');
    //     assert(err.message === 'generator process exception');
    //     done();
    //   });
    //   client.on('event_code', () => {
    //     throw new Error('normal function process exception');
    //   });
    //   client.once('event_code', async () => {
    //     throw new Error('async function process exception');
    //   });
    //   client.emit('event_code');
    // });

    it('should remove listener', done => {
      const client = new SomeServiceClient();
      const handler = async (data: number) => {
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
      assert.equal(client.listeners('event_code').length, 0);
    });

    // it('should not allow to add generator listener on error event', () => {
    //   const client = new SomeServiceClient();
    //   assert.throws(() => {
    //     client.on('error', function* (err) {
    //       console.error(err);
    //     });
    //   }, null, /\[sdk-base\] `error` event should not have a generator listener\./);
    // });
  });

  describe('await', () => {
    it('should support client.await', async () => {
      const client = new SomeServiceClient();
      setTimeout(() => client.emit('someEvent', 'foo'), 100);
      const res = await client.await('someEvent');
      assert.equal(res, 'foo');
    });

    // it('should support client.awaitFirst', function* () {
    //   const client = new SomeServiceClient();
    //   setTimeout(() => client.emit('foo', 'foo'), 200);
    //   setTimeout(() => client.emit('bar', 'bar'), 100);
    //   const o = yield client.awaitFirst([ 'foo', 'bar' ]);
    //   assert.deepEqual(o, {
    //     event: 'bar',
    //     args: [ 'bar' ],
    //   });
    //   assert(client.listenerCount('foo') === 0);
    //   assert(client.listenerCount('bar') === 0);
    // });
  });

  describe('close', () => {
    // describe('generate close', () => {
    //   class GenerateCloseClient extends Base {
    //     * _close() {
    //       yield cb => process.nextTick(() => {
    //         cb();
    //       });
    //     }
    //   }
    //   it('should success', function* () {
    //     const client = new GenerateCloseClient();
    //     yield client.close();
    //     assert(client._closed === true);
    //   });
    // });

    describe('promise close', () => {
      class PromiseCloseClient extends Base {
        _close() {
          return new Promise<void>(resolve => {
            process.nextTick(() => {
              resolve();
            });
          });
        }
      }

      it('should success', async () => {
        const client = new PromiseCloseClient();
        assert.equal(client.isClosed, false);
        await client.close();
        assert.equal(client.isClosed, true);
      });
    });

    describe('async function _close', () => {
      class PromiseCloseClient extends Base {
        async _close() {
          await scheduler.wait(10);
        }
      }

      it('should success', async () => {
        const client = new PromiseCloseClient();
        assert.equal(client.isClosed, false);
        await client.close();
        assert.equal(client.isClosed, true);
        await client.close();
        assert.equal(client.isClosed, true);
      });
    });

    describe('no _close', () => {
      class NoCloseClient extends Base {
      }

      it('should success', async () => {
        const client = new NoCloseClient();
        assert.equal(client.isClosed, false);
        await client.close();
        assert.equal(client.isClosed, true);
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
          return new Promise<void>(resolve => {
            process.nextTick(() => {
              resolve();
            });
          });
        }
      }

      describe('serial close', () => {
        it('should success', async () => {
          const client = new PromiseCloseClient();
          await client.close();
          await client.close();
          assert(client.isClosed === true);
          assert(calledTimes === 1);
        });
      });

      describe('parallel close', () => {
        it('should success', async () => {
          const client = new PromiseCloseClient();
          await Promise.all([
            client.close(),
            client.close(),
          ]);
          assert.equal(client.isClosed, true);
          assert(calledTimes === 1);
        });
      });
    });

    describe('error close', () => {
      class ErrorCloseClient extends Base {
        _close() {
          return new Promise((_, reject) => {
            reject(new Error('mock error'));
          });
        }
      }

      it('should success', async () => {
        const client = new ErrorCloseClient();
        let error: Error;
        client.on('error', e => {
          error = e;
        });
        await client.close();
        assert.equal(client.isClosed, true);
        assert(error!);
        assert(error instanceof Error);
        assert(/mock error/.test(error.message));
      });
    });
  });
});
