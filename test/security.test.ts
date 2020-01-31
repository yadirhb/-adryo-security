import security from '../src/index';

describe('Authenticate', () => {
  it('Creates function middleware', () => {
    expect(typeof security.authenticate({ secretKey: 's3cret' })).toEqual(
      'function'
    );
  });

  it('Decomposes the token', async () => {
    const token =
      'Barear eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiZm9vYmFyIiwiaWF0IjoxNTgwNDQzMDY3fQ.M6XTpzZEZxU86MLZGusAYSPdcyb3gjL9FHowp9BKhx4';
    const middleware = security.authenticate({
      secretKey: 's3cr3t',
      validator: decryptedToken =>
        new Promise((resolve, reject) => {
          decryptedToken ? resolve() : reject();
          expect(decryptedToken).toBe('foobar');
        }),
    });

    return middleware(
      { headers: { authorization: token } },
      { status: () => {}, json: () => {} },
      () => {}
    );
  });
});
