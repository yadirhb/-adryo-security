import { tokenize } from '../src/index';

describe('Authenticate', () => {
  it('Creates function middleware', () => {
    expect(
      typeof tokenize({
        secretKey: 's3cret',
        provider: data =>
          new Promise((resolve, reject) => (data ? resolve() : reject())),
      })
    ).toEqual('function');
  });
});
