import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { SettingsService } from 'services';
import { validateDeviceName } from 'validations';

export function updateDeviceName(socket: Socket, id: string) {
  addEventListener(
    socket,
    id,
    'UPDATE_DEVICE_NAME',
    async ({ deviceName }: { deviceName: string }) => {
      deviceName = deviceName.trim();
      const validationError = validateDeviceName(deviceName);
      if (validationError) throw new Error(validationError);
      await SettingsService.getInstance().setDeviceName(deviceName);
    },
    {
      failureDataFn: error => error.message,
    },
  );
}
