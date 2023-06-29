import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { VersionService } from 'services';
import pkg from '../../../package.json';

export function installUpdate(socket: Socket, id: string) {
  addEventListener(socket, id, 'INSTALL_UPDATE', async () => {
    const versionService = VersionService.getInstance();
    const newestVersion = (await versionService.getVersion()) ?? pkg.version;
    if (newestVersion < pkg.version)
      throw new Error('Cannot install update. Version is not newer than current version.');
    if (versionService.getIsCurrentlyUpdating()) throw new Error('Cannot install update. Update already in progress.');
    versionService.beginVersionUpdate().catch(console.error);
  });
}
