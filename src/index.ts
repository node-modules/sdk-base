import util from 'node:util';
import assert from 'node:assert';
import { once } from 'node:events';
import { AsyncLocalStorage } from 'node:async_hooks';
import { ReadyEventEmitter } from 'get-ready';
import { isPromise, isGeneratorFunction } from 'is-type-of';
import { promiseTimeout } from 'utility';

export interface BaseOptions<T = any> {
  initMethod?: string;
  localStorage?: AsyncLocalStorage<T>;
  [key: string]: any;
}

export class Base<T = any> extends ReadyEventEmitter {
  options: BaseOptions<T>;
  #closed = false;

  constructor(options?: BaseOptions<T>) {
    super();

    if (options?.initMethod) {
      const initMethod = Reflect.get(this, options.initMethod);
      assert(typeof initMethod === 'function',
        `[sdk-base] this.${options.initMethod} should be a function`);
      assert(!isGeneratorFunction(initMethod),
        `[sdk-base] this.${options.initMethod} generator function is not support`);

      process.nextTick(() => {
        const ret = initMethod.apply(this);
        assert(isPromise(ret), `[sdk-base] this.${options.initMethod} should return a promise`);
        ret.then(() => this.ready(true))
          .catch(err => this.ready(err));
      });
    }
    this.options = options ?? {};
    this.on('error', err => {
      this._defaultErrorHandler(err);
    });
  }

  /**
   * support `await this.await('event')`
   */
  await(event: string) {
    return once(this, event);
  }

  /**
   * get AsyncLocalStorage from options
   * @return {AsyncLocalStorage} asyncLocalStorage instance or undefined
   */
  get localStorage() {
    return this.options.localStorage;
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
    this.#closed = true;
    const closeFunc = Reflect.get(this, '_close');
    if (typeof closeFunc !== 'function') {
      return;
    }

    try {
      await closeFunc.apply(this);
    } catch (err) {
      this.emit('error', err);
    }
  }
}
