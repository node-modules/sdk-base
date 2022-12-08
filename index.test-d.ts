import { expectType } from 'tsd';
import Base from '.';

class MockContenxt {}

class Client extends Base<MockContenxt> {
  
}

const client = new Client();

expectType<Promise<void>>(client.readyOrTimeout(1000));
expectType<Promise<any>>(client.ready());
expectType<MockContenxt | undefined>(client.localStorage?.getStore());
