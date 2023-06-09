/**
 * A validation function for API keys.
 * @param apiKey The API key
 * @returns A boolean
 */
export function validateApiKey(apiKey: string) {
  if (!apiKey || apiKey.length === 0) return 'Please enter an API Key';
}
