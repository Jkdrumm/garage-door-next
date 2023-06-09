import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { VersionService } from 'services';

export async function checkForNewVersion(socket: Socket, id: string) {
  addEventListener(socket, id, 'CHECK_FOR_NEW_VERSION', async () => {
    const versionService = VersionService.getInstance();
    return {
      version: await versionService.hardCheckNewVersion(),
      timeOfLastCheck: versionService.getLastCheckedForUpdate()
    };
  });
}
