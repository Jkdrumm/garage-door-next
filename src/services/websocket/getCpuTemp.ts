import { Socket } from 'socket.io';
import { addEventListener } from './utils';
import { cpuTemperature } from 'systeminformation';

export function getCpuTemp(socket: Socket, id: string) {
  addEventListener(socket, id, 'GET_CPU_TEMP', async () => {
    const temp = await cpuTemperature();
    return temp.max;
  });
}
