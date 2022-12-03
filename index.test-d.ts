import { expectType } from 'tsd';
import Base from '.';

class Client extends Base {
  
}

const client = new Client();

expectType<Promise<void>>(client.readyOrTimeout(1000));
expectType<Promise<any>>(client.ready());
