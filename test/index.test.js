'use strict';

const Base = require('..');
const assert = require('assert');
const pedding = require('pedding');

describe('sdk-base', () => {
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
      client.ready(done);
      client.ready(true);
      // again should work
      client.ready(true);
    });
  });

  describe('options.initMethod', () => {
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

    it('should auto init with options.initMethod', function* () {
      const client = new Client({ a: 'a' });
      assert.deepEqual(client.options, {
        a: 'a',
        initMethod: 'init',
      });
      yield client.ready();
      yield client.ready();
      assert(client.foo === 'bar');
    });

    it('should trigger ready callback without err', done => {
      const client = new Client();
      client.ready(err => {
        assert.ifError(err);
        done();
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
      }, '[sdk-base] `error` event should not have a generator listener.');
    });
  });

  describe('await', () => {
    it('should support client.await', function* () {
      const client = new SomeServiceClient();
      setTimeout(() => client.emit('someEvent', 'foo'), 100);
      const res = yield client.await('someEvent');
      assert(res === 'foo');
    });
  });
});
