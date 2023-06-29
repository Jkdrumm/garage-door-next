/**
 * A validation function for passwords.
 * @param password The password
 * @returns A boolean
 */
export function validatePassword(password: string) {
  if (!password || password.length === 0) return 'Please enter a password';
  if (password.length < 8) return 'password must be a minimum of 8 characters';
}
