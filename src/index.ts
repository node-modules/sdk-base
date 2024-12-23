import util from 'node:util';
import assert from 'node:assert';
import { once } from 'node:events';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getAsyncLocalStorage } from 'gals';
import { ReadyEventEmitter } from 'get-ready';
import { isPromise, isGeneratorFunction } from 'is-type-of';
import { promiseTimeout } from 'utility';

export interface BaseOptions<T = any> {
  initMethod?: string;
  localStorage?: AsyncLocalStorage<T>;
  [key: string]: any;
}

export abstract class Base<T = any> extends ReadyEventEmitter {
  options: BaseOptions<T>;
  #closed = false;
  #localStorage: AsyncLocalStorage<T>;

  constructor(options?: BaseOptions<T>) {
    super();

    if (options?.initMethod) {
      const initMethod = Reflect.get(this, options.initMethod) as () => Promise<void>;
      assert(typeof initMethod === 'function',
        `[sdk-base] this.${options.initMethod} should be a function`);
      assert(!isGeneratorFunction(initMethod),
        `[sdk-base] this.${options.initMethod} should not be generator function`);

      process.nextTick(() => {
        const ret = initMethod.apply(this);
        assert(isPromise(ret), `[sdk-base] this.${options.initMethod} should return a promise`);
        ret.then(() => {
          this.ready(true);
        }).catch(err => {
          const hasReadyCallbacks = this.hasReadyCallbacks;
          this.ready(err);
          // no ready callbacks, should emit error event instead
          if (!hasReadyCallbacks) {
            this.emit('error', err);
          }
        });
      });
    }
    this.options = options ?? {};
    this.#localStorage = this.options.localStorage ?? getAsyncLocalStorage<T>();
    super.on('error', err => {
      this._defaultErrorHandler(err);
    });
  }

  /**
   * support `await this.await('event')`
   */
  async await(event: string) {
    const values = await once(this, event);
    return values[0];
  }

  /**
   * get AsyncLocalStorage from options
   * @return {AsyncLocalStorage} asyncLocalStorage instance or undefined
   */
  get localStorage() {
    return this.#localStorage;
  }

  async readyOrTimeout(milliseconds: number) {
    await promiseTimeout(this.ready(), milliseconds);
  }

  _defaultErrorHandler(err: any) {
    if (this.listeners('error').length > 1) {
      // ignore defaultErrorHandler
      return;
    }
    console.error('\n[%s][pid: %s][%s] %s: %s \nError Stack:\n  %s',
      Date(), process.pid, this.constructor.name, err.name,
      err.message, err.stack);

    // try to show addition property on the error object
    // e.g.: `err.data = {url: '/foo'};`
    const additions = [];
    for (const key in err) {
      if (key === 'name' || key === 'message') {
        continue;
      }
      additions.push(util.format('  %s: %j', key, err[key]));
    }
    if (additions.length) {
      console.error('Error Additions:\n%s', additions.join('\n'));
    }
    console.error();
  }

  async close() {
    if (this.#closed) {
      return;
    }
    const closeMethod = Reflect.get(this, '_close');

    if (typeof closeMethod !== 'function') {
      this.#closed = true;
      return;
    }

    try {
      const result = await closeMethod.apply(this);
      this.#closed = true;
      return result;
    } catch (err) {
      this.emit('error', err);
    }
  }

  get isClosed() {
    return this.#closed;
  }
}
