import ISecurityConfig from './interfaces/ISecurityConfig';
import ITokenProvider from './interfaces/ITokenProvider';
import jwt from 'jsonwebtoken';
const HTTP_UNAUTHORIZED = 401;

const handleError = (response: any, code: number, error: string | Object) => {
  const resp = response.status(code);
  if (typeof error === 'string') {
    resp.end(error);
  } else {
    resp.json(error);
  }
  if (__DEV__) console.error(error);
};

export const authenticate = ({ secretKey, validator }: ISecurityConfig) => (
  request: { headers: { authorization: string } },
  response: any,
  next: Function
) => {
  const { authorization } = request.headers;
  if (authorization) {
    const [type, token] = authorization.split(' ');
    if (type && token) {
      // verify a token symmetric
      if (secretKey) {
        return jwt.verify(token, secretKey, (err: any, decrypted: any) => {
          if (!err) {
            const { data } = decrypted;
            if (validator) {
              try {
                validator(data)
                  .then(() => next())
                  .catch(error =>
                    handleError(response, HTTP_UNAUTHORIZED, error)
                  );
              } catch (error) {
                return handleError(response, 500, error);
              }
            } else {
              return next();
            }
          } else {
            return handleError(response, HTTP_UNAUTHORIZED, err);
          }
        });
      } else {
        return handleError(
          response,
          503,
          'No security key provided to decrypt the token'
        );
      }
    }
  }
  response.status(HTTP_UNAUTHORIZED).end();
};

export const tokenize = ({
  secretKey,
  provider,
  signatureOptions = { algorithm: 'RS256' },
}: ITokenProvider) => (request: any, response: any, next: Function) => {
  if (secretKey && provider) {
    try {
      provider(request)
        .then(data => {
          jwt.sign(data, secretKey, signatureOptions, (error, jwt) => {
            if (error && jwt) {
              return handleError(response, 500, error);
            }

            request = { ...request, jwt };
            next();
            if (__DEV__) console.log('Token generated', jwt);
          });
        })
        .catch(error => handleError(response, 500, error));
    } catch (error) {
      handleError(response, 500, error);
    }
  } else {
    handleError(
      response,
      503,
      'No data provider to generate token or not secretKey. Provide {secretKey, provider:() => Promise}'
    );
  }
};
