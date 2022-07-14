export const validateApiKey = (apiKey: string) => {
  if (!apiKey || apiKey.length === 0) return 'Please enter an API Key';
};
