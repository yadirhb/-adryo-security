import IValidator from './IValidator';

export default interface ISecurityConfig {
  secretKey: string;
  validator?: IValidator;
}
