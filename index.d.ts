/* =================== USAGE ===================
  import Base from "sdk-base";
  class newSDK extends Base {}
  class newSDK extends Base<FooContext> {}
=============================================== */

import { EventEmitter } from 'events';
import { AsyncLocalStorage } from 'async_hooks';

export interface BaseOptions {
  initMethod?: string;
  localStorage?: any;
  [key: string]: any;
}

export default class Base<TContext = any> extends EventEmitter {
  constructor(option?: BaseOptions);

  isReady: boolean;
  options: BaseOptions;
  localStorage?: AsyncLocalStorage<TContext>;
  await(...args: any[]): Promise<any>;
  awaitFirst(...args: any[]): Promise<any>;
  ready(): Promise<any>;
  ready(err: Error): void;
  ready(ready: boolean): void;
  ready(readyCallback: Function): void;
  readyOrTimeout(milliseconds: number): Promise<void>;
}
