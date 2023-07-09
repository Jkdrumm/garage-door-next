/**
 * A validation function for device names.
 * @param deviceName The device name
 * @returns A boolean
 */
export function validateDeviceName(deviceName: string) {
  deviceName = deviceName.trim();
  // Allow only alphanumeric characters, dashes, underscores, spaces, ampersands, and apostrophes
  if (!/^[a-zA-Z0-9-_& ']+$/.test(deviceName)) return 'Device name cannot contain special characters';
  if (deviceName.length < 3) return 'Device name must be at least 3 characters';
  if (deviceName.length > 32) return 'Device name must be at most 32 characters';
}
