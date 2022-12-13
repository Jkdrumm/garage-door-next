export class OpenSslService {
  private constructor() {}

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): OpenSslService {
    if (!global.openSslServiceInstance) global.openSslServiceInstance = new OpenSslService();
    return global.openSslServiceInstance;
  }

  /**
   * Get the randomly determined value for the NextAuth secret.
   * @returns The NextAuth secret value
   */
  public getRand() {
    return global.NEXTAUTH_SECRET;
  }
}

// Load the service immediately
OpenSslService.getInstance();
