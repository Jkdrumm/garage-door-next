import axios from 'axios';
import fs from 'fs';
import path from 'path';
import decompress from 'decompress';
// import archiver from 'archiver';
import { execSync } from 'child_process';
import pack from '../../package.json';
import { WebSocketService } from './WebSocketService';
import { UserLevel } from 'enums';

export class VersionService {
  private version: string | undefined;
  private downloadUrl: string | undefined;
  private assetName: string | undefined;
  private lastCheckedForUpdate: string | undefined;
  private isCurrentlyUpdating = false;

  private constructor() {}

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): VersionService {
    if (!global.versionServiceInstance) global.versionServiceInstance = new VersionService();
    return global.versionServiceInstance;
  }

  /**
   * Gets the cached new version.
   * @returns The cached version number (e.g. 1.5.2)
   */
  public async getVersion() {
    // If we should check for an update, do so.
    if (this.shouldCheckForUpdate()) return this.hardCheckNewVersion();
    // Otherwise, return the cached version.
    return this.version;
  }

  /**
   * Gets the version for prefetching. This will not check for an update.
   * @returns The cached version number (e.g. 1.5.2) or undefined if we should check for an update.
   */
  public getVersionForPrefetch() {
    if (this.shouldCheckForUpdate()) return undefined;
    return this.version;
  }

  /**
   * Determines if we should check for an update.
   * @returns Whether or not we should check for an update.
   */
  public shouldCheckForUpdate() {
    // If we haven't checked for an update since booting, do so.
    if (!this.lastCheckedForUpdate) return true;
    // Get the time between last checking for an update and now.
    const timeSinceLastCheck = new Date().getTime() - new Date(this.lastCheckedForUpdate).getTime();
    // If it's been more than a day, check for an update.
    if (timeSinceLastCheck > 86400000) return true;
    return false;
  }

  /**
   * Forces a call to the GitHub API to check for a new version.
   * @returns The remote version number (e.g. 1.5.2)
   */
  public async hardCheckNewVersion() {
    const { data } = await axios.get<VersionInfo>(
      'https://api.github.com/repos/Jkdrumm/garage-door-next/releases/latest'
    );
    this.version = data.name;
    this.lastCheckedForUpdate = new Date().toISOString();
    // No asset for some reason, default back to saying we have the newest version.
    if (data.assets.length === 0) return pack.version;
    const asset = data.assets[0];
    this.downloadUrl = asset.browser_download_url;
    this.assetName = asset.name;
    // If in development mode, set the newest version to 0.0.1 higher so we can test updates.
    if (process.env.NODE_ENV === 'development') {
      const versionParts = this.version.split('.');
      versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
      this.version = versionParts.join('.');
    }
    return this.version;
  }

  /**
   * Gets the time the last update check was performed.
   */
  public getLastCheckedForUpdate() {
    return this.lastCheckedForUpdate;
  }

  /**
   * Downloads the newest version from GitHub into the versions folder
   */
  private async downloadNewVersion() {
    if (!this.version) throw new Error('Version is not defined');
    if (!this.downloadUrl) throw new Error('Download URL is not defined');
    if (!this.assetName) throw new Error('Asset name is not defined');
    // If running in development mode, just set a timeout for 5 seconds.
    if (process.env.NODE_ENV === 'development') {
      await new Promise(r => setTimeout(r, 5000));
      return;
    }
    const response = await axios({ method: 'get', url: this.downloadUrl, responseType: 'stream' });
    const writer = fs.createWriteStream(this.assetName);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    if (!fs.existsSync('versions')) fs.mkdirSync('versions');
    await decompress(this.assetName, `versions/${this.version}`);
    // Delete the zipped file
    fs.unlinkSync(this.assetName);
  }

  /**
   * Creates a backup of all files minus versions and backups
   */
  // private async createBackup() {
  //   // Wait just a second before backing things up;
  //   await new Promise(r => setTimeout(r, 1000));
  //   if (!fs.existsSync('backups')) fs.mkdirSync('backups');
  //   const output = fs.createWriteStream('backups/backup.zip');
  //   const archive = archiver('zip', {
  //     zlib: { level: 9 } // Set the compression level
  //   });
  //   archive.on('error', console.error);
  //   archive.on('warning', console.warn);
  //   archive.pipe(output);
  //   archive.glob('.', {
  //     ignore: ['versions/**', 'backups/**', 'node_modules/**', 'greenlock.d/**', 'mongo_key_temp.*', 'mongoserver.asc'],
  //     pattern: []
  //   });
  //   await archive.finalize();
  // }

  /**
   * Copies data from the recently downloaded version folder.
   */
  private async installUpdate() {
    // If running in development mode, just set a timeout for 5 seconds.
    if (process.env.NODE_ENV === 'development') {
      await new Promise(r => setTimeout(r, 5000));
      return;
    }
    const sourceFolder = `versions/${this.version}`;
    const destinationFolder = '';
    this.copyDirRecurisveSync(sourceFolder, destinationFolder);
    // Install dependencies so we don't have to bundle them in the release.
    execSync('npm install --omit=dev');
    // Prune dependencies to save space.
    execSync('npm prune --omit=dev');
  }

  /**
   * Recursively copies a folder
   * @param sourceDir The source to copy from
   * @param destDir The destination to copy to
   */
  private copyDirRecurisveSync(sourceDir: string, destDir: string) {
    const files = fs.readdirSync(sourceDir);

    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);

      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        this.copyDirRecurisveSync(sourcePath, destPath);
      } else fs.copyFileSync(sourcePath, destPath);
    }
  }

  /**
   * Gets if the application is currently updating.
   */
  public getIsCurrentlyUpdating() {
    return this.isCurrentlyUpdating;
  }

  /**
   * Begins the update process.
   */
  public async beginVersionUpdate() {
    if (this.isCurrentlyUpdating) throw new Error('Already updating');
    this.isCurrentlyUpdating = true;
    const webSocketService = WebSocketService.getInstance();
    try {
      await this.downloadNewVersion();
      // TODO: Allow backups to actually do something. Until then, no point in making backups.
      // await this.createBackup();
      await this.installUpdate();
      webSocketService.emitMessage('UPDATE_COMPLETE', UserLevel.ACCOUNT);
      this.restart();
    } catch (error) {
      this.isCurrentlyUpdating = false;
      console.error(error);
      webSocketService.emitMessage('UPDATE_FAILED', UserLevel.ADMIN);
    }
  }

  /**
   * Restarts the application from the root.
   */
  public restart() {
    if (process.env.NODE_ENV !== 'development') global.completeUpdate();
    else this.isCurrentlyUpdating = false;
  }
}

export interface VersionInfo {
  name: string;
  assets: Asset[];
}

export interface Asset {
  name: string;
  browser_download_url: string;
}
