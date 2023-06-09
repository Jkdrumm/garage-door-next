import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { VersionService } from 'services';

export async function getVersion(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_VERSION', async () => {
    const versionService = VersionService.getInstance();
    return {
      version: await versionService.getVersion(),
      timeOfLastCheck: versionService.getLastCheckedForUpdate(),
      isCurrentlyUpdating: versionService.getIsCurrentlyUpdating()
    };
  });
}
