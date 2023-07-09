import { DatabaseService, WebSocketService } from 'services';

type Settings = {
  setupComplete: boolean;
  dnsHostname: string;
  dnsApiKey: string;
  dnsApiSecret: string;
  nextAuthSecret: string;
  deviceName: string;
};

export class SettingsService {
  private settings: Settings = {} as Settings;
  // eslint-disable-next-line no-unused-vars
  private promiseList: ((value: string) => void)[] = [];

  private constructor() {
    this.loadSettings();
  }

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): SettingsService {
    if (!global.settingsServiceInstance) global.settingsServiceInstance = new SettingsService();
    return global.settingsServiceInstance;
  }

  /**
   * Sets the device name
   * @param deviceName The device name
   */
  public async setDeviceName(deviceName: string) {
    const client = await DatabaseService.getInstance().getClientAsync();
    await client.collection('settings').updateOne({}, { $set: { deviceName } }, { upsert: true });
    this.settings.deviceName = deviceName;
    WebSocketService.getInstance().emitMessage('DEVICE_NAME', deviceName);
  }

  /**
   * Gets the device name
   * @returns The device name
   */
  public getDeviceName() {
    return this.settings.deviceName ?? null;
  }

  /**
   * Gets the NextAuth secret value
   * @returns The NextAuth secret value
   */
  public getNextAuthSecret() {
    return this.settings.nextAuthSecret;
  }

  public getNextAuthSecretAsync() {
    if (this.settings.nextAuthSecret) return Promise.resolve(this.settings.nextAuthSecret);
    const promise = new Promise<string>(resolve => {
      this.promiseList.push(resolve);
    });
    return promise;
  }

  /**
   * Loads the settings from the database
   * @returns The settings
   */
  private async loadSettings() {
    const client = await DatabaseService.getInstance().getClientAsync();
    const savedSettings = await client.collection('settings').findOne<Settings>();
    if (!savedSettings) throw new Error('Settings not found');
    this.settings = savedSettings;
    this.promiseList.forEach(resolve => resolve(this.settings.nextAuthSecret));
    this.promiseList = [];
  }
}
