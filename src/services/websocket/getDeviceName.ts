import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { SettingsService } from 'services';

export function getDeviceName(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_DEVICE_NAME', () => SettingsService.getInstance().getDeviceName());
}
