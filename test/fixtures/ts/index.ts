import Base, { BaseOptions } from '../../..';

class FooContext {
  traceId?: string;
}

class ClientSimple extends Base {}

class Client extends Base<FooContext> {
  errorHandlerLength: number = 0;

  constructor(options: BaseOptions & { foo: string }) {
    super({
      initMethod: 'init',
      ...options,
    });
  }

  init() {
    this.errorHandlerLength = this.listeners('error').length;
    setTimeout(() => {
      this.ready(true);
      this.emit('someEvent');
    }, 100);
    setTimeout(() => {
      this.emit('one');
    }, 200);

    return Promise.resolve();
  }

  handleError(err: Error) {
    throw err;
  }

  handleMessage(message: string) {
    console.log(message, this.isReady);
  }
}

export async function test() {
  let client: Client;
  
  client = new Client({ foo: 'bar' });
  client.ready(() => {
    console.log('ready');
    console.log('localStorage should be undefined: %o', client.localStorage?.getStore());
  });
  await client.await('someEvent');
  await client.awaitFirst([ 'one', 'two' ]);

  return client.isReady;

}
