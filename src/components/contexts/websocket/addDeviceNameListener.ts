import { QueryClient } from '@tanstack/react-query';
import { DEVICE_NAME_QUERY_KEY } from 'hooks';
import { ClientSocket } from 'types';

export function addDeviceNameListener(socket: ClientSocket, queryClient: QueryClient) {
  socket.on('DEVICE_NAME', deviceName => queryClient.setQueryData<string>([DEVICE_NAME_QUERY_KEY], deviceName));
}
