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
  return { code, error };
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
        return jwt.verify(token, secretKey, (err: any, data: any) => {
          if (!err) {
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
  return handleError(response, HTTP_UNAUTHORIZED, 'No Authorization header');
};

export const tokenize = ({ secretKey, provider }: ITokenProvider) => (
  request: any,
  response: any,
  next: Function
) =>
  new Promise((resolve, reject) => {
    if (secretKey && provider) {
      try {
        provider(request)
          .then(data => {
            jwt.sign(
              data,
              secretKey,
              (error: string | Object, jwt: unknown) => {
                if (error) {
                  return reject(handleError(response, 500, error));
                }

                if (jwt) {
                  request['jwt'] = jwt;
                  next();
                  return resolve(jwt);
                }

                return handleError(response, 503, 'Unable to generate token');
              }
            );
          })
          .catch(error => reject(handleError(response, 500, error)));
      } catch (error) {
        reject(handleError(response, 500, error));
      }
    } else {
      reject(
        handleError(
          response,
          503,
          'No data provider to generate token or not secretKey. Provide {secretKey, provider:() => Promise}'
        )
      );
    }
  });
