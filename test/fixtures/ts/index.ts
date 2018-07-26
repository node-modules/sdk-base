'use strict';

import Base, { BaseOptions } from '../../..';

class Client extends Base {
  errorHandlerLength: number = 0;

  constructor(options?: BaseOptions) {
    super(Object.assign({
      initMethod: 'init',
    }, options));
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

export function* test() {

  let client;
  
  client = new Client();
  client.ready(() => {
    console.log('ready');
  });
  yield client.await('someEvent');
  yield client.awaitFirst([ 'one', 'two' ]);

  return client.isReady;

}
