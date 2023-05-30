import axios from 'axios';
import fs from 'fs';
import path from 'path';
import decompress from 'decompress';
import archiver from 'archiver';
import { execSync } from 'child_process';
import pack from '../../package.json';

export class VersionService {
  private version: string | undefined;
  private downloadUrl: string | undefined;
  private assetName: string | undefined;

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
   * Gets the cached new version
   * @returns The cached version number (e.g. 1.5.2)
   */
  public async getVersion() {
    // if (this.version) return this.version;
    // For now, always do a hard check.
    // TODO: Employ some caching to avoid getting rate limited.
    return this.hardCheckNewVersion();
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
    // No asset for some reason, default back to saying we have the newest version.
    if (data.assets.length === 0) return pack.version;
    const asset = data.assets[0];
    this.downloadUrl = asset.browser_download_url;
    this.assetName = asset.name;
    return this.version;
  }

  /**
   * Downloads the newest version from GitHub into the versions folder
   */
  public async downloadNewVersion() {
    if (!this.version) throw new Error('Version is not defined');
    if (!this.downloadUrl) throw new Error('Download URL is not defined');
    if (!this.assetName) throw new Error('Asset name is not defined');
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
  public async createBackup() {
    // Wait just a second before backing things up;
    await new Promise(r => setTimeout(r, 1000));
    if (!fs.existsSync('backups')) fs.mkdirSync('backups');
    const output = fs.createWriteStream('backups/backup.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 } // Set the compression level
    });
    archive.on('error', console.error);
    archive.on('warning', console.warn);
    archive.pipe(output);
    archive.glob('.', {
      ignore: ['versions/**', 'backups/**', 'node_modules/**', 'greenlock.d/**', 'mongo_key_temp.*', 'mongoserver.asc'],
      pattern: []
    });
    await archive.finalize();
  }

  /**
   * Copies data from the recently downloaded version folder.
   */
  public async installUpdate() {
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
   * Restarts the application from the root.
   */
  public restart() {
    if (process.env.NODE_ENV !== 'development') global.completeUpdate();
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

// Load the service immediately
VersionService.getInstance();
