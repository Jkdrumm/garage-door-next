export const validateName = (name: string) => {
  if (!name || name.length === 0) return 'Please enter a name';
  if (name.length > 32) return 'Name can be at most 32 characters';
};
