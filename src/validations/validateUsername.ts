/**
 * A validation function for usernames.
 * @param username The username
 * @returns A boolean
 */
export function validateUsername(username: string) {
  if (!username || username.length === 0) return 'Please enter a username';
  if (username.length > 32) return 'Username can be at most 32 characters';
}
