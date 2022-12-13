/**
 * A validation function for API secret keys.
 * @param secret The API secret key
 * @returns A boolean
 */
export function validateApiSecret(secret: string) {
  if (!secret || secret.length === 0) return 'Please enter the API Secret Key';
}
