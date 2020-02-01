import { tokenize } from '../src/index';
import ITokenProvider from 'interfaces/ITokenProvider';

class TestProvider implements ITokenProvider {
  constructor(public secretKey: string) {}

  provider(request: { body: any }) {
    // console.log('REQUEST', request.body);
    return new Promise((resolve, reject) =>
      request.body ? resolve(request.body) : reject()
    );
  }
}

class MockResponse {
  private code: number = 200;
  private response: { code: number; response?: any } = { code: 200 };
  status(code: number) {
    this.code = code;
    return this;
  }

  json(response: Object) {
    this.response = { code: this.code, response };
  }

  end(response?: string) {
    this.response = { code: this.code, response };
  }

  send(response?: string) {
    this.response = { code: this.code, response };
  }

  getResponse() {
    return this.response;
  }
}

describe('Authenticate', () => {
  const config = new TestProvider('s3cr3t');
  it('Creates function middleware', () => {
    expect(typeof tokenize(config)).toEqual('function');
  });

  it('Creates the token', () => {
    const middleware = tokenize(config);
    expect(typeof middleware).toEqual('function');
    const response = new MockResponse();
    const request: { body: any; jwt?: string } = { body: { name: 'John' } };

    middleware(request, response, () => expect(!!request['jwt']).toBe(true));
  });
});
