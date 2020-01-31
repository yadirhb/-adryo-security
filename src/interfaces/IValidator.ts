/**
 * This function is used to provide a custom validator for authentication.
 */
export default interface IValidator {
  /**
   * @param decryptedToken
   */
  (decryptedToken: any): Promise<any>;
}
