import IValidator from './IValidator';

export default interface IConfig {
  secretKey: string;
  validator?: IValidator;
}
