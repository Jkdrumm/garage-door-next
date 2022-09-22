export class OpenSslService {
  private constructor() {}

  public static getInstance(): OpenSslService {
    if (!global.openSslServiceInstance) global.openSslServiceInstance = new OpenSslService();
    return global.openSslServiceInstance;
  }

  public getRand() {
    return global.NEXTAUTH_SECRET;
  }
}

// Load the service immediately
OpenSslService.getInstance();
