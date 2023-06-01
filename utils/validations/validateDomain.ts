/**
 * A validation function for domain names.
 * @param hostname The hostname
 * @returns A boolean
 */
export function validateDomain(hostname: string) {
  if (!hostname || hostname.length === 0) return 'Please enter a hostname';
  if (
    !/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/.exec(
      hostname
    )
  )
    return 'Please enter a valid hostname';
}
