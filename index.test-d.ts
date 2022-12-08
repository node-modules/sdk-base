import { expectType } from 'tsd';
import { AsyncLocalStorage } from 'async_hooks';
import Base from '.';

class MockContenxt {}

class Client extends Base<MockContenxt> {
  constructor() {
    super({
      initMethod: 'init',
      localStorage: new AsyncLocalStorage<MockContenxt>,
    });
  }
}

const client = new Client();

expectType<Promise<void>>(client.readyOrTimeout(1000));
expectType<Promise<any>>(client.ready());
expectType<MockContenxt | undefined>(client.localStorage?.getStore());
