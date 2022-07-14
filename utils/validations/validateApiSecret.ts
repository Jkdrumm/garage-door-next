export const validateApiSecret = (secret: string) => {
  if (!secret || secret.length === 0) return 'Please enter the API Secret Key';
};
