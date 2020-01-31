/**
 * This function is used to provide a custom validator for authentication.
 */
export interface IProviderFunction {
  /**
   * @param request
   */
  (request: any): Promise<any>;
}

export default interface ITokenProvider {
  secretKey: string;
  provider: IProviderFunction;
  signatureOptions?: Object;
}
