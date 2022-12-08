/* =================== USAGE ===================
  import Base from "sdk-base";
  class newSDK extends Base<FooContext> {}
=============================================== */

import { EventEmitter } from 'events';
import { AsyncLocalStorage } from 'async_hooks';

interface BaseOptions<TContext> {
  initMethod?: string;
  // any Context, e.g.: koa/egg Context
  localStorage?: AsyncLocalStorage<TContext>;
  [key: string]: any;
}

export default class Base<TContext> extends EventEmitter {
  constructor(option?: BaseOptions<TContext>);

  isReady: boolean;
  options: BaseOptions<TContext>;
  localStorage?: AsyncLocalStorage<TContext>;
  await(...args: any[]): Promise<any>;
  awaitFirst(...args: any[]): Promise<any>;
  ready(): Promise<any>;
  ready(err: Error): void;
  ready(ready: boolean): void;
  ready(readyCallback: Function): void;
  readyOrTimeout(milliseconds: number): Promise<void>;
}
