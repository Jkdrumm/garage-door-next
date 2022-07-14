export const validateDomain = (hostname: string) => {
  if (!hostname || hostname.length === 0) return 'Please enter a hostname';
  if (
    !hostname.match(
      /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
    )
  )
    return 'Please enter a valid hostname';
};
