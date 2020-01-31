import IConfig from './interfaces/IConfig';
import jwt from 'jsonwebtoken';
const HTTP_UNAUTHORIZED = 401;

export const authenticate = ({ secretKey, validator }: IConfig) => (
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
                const promise = validator(data);
                if (!(promise instanceof Promise)) {
                  throw new Error(
                    '[InvalidAuthValidatorError] AuthValidator must return Promise.'
                  );
                }
                promise
                  .then(() => next())
                  .catch(error => {
                    response.status(HTTP_UNAUTHORIZED).json({ error });
                    if (__DEV__) console.error(error);
                  });
              } catch (error) {
                response.status(500).json({ error });
                if (__DEV__) console.error(error);
                return;
              }
            } else {
              return next();
            }
          } else {
            response.status(HTTP_UNAUTHORIZED).json({ error: err });
            if (__DEV__) console.error(err);
          }
        });
      } else {
        response
          .status(503)
          .end('No security key provided to decrypt the token');
      }
    }
  }
  response.status(HTTP_UNAUTHORIZED);
};
