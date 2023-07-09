import { checkForNewVersion } from './checkForNewVersion';
import { configureCertificates } from './configureCertificates';
import { deleteUser } from './deleteUser';
import { getCpuTemp } from './getCpuTemp';
import { getDeviceName } from './getDeviceName';
import { getDiskSpace } from './getDiskSpace';
import { getDnsInfo } from './getDnsInfo';
import { getLogs } from './getLogs';
import { getNumNotifications } from './getNumNotifications';
import { getUserLevel } from './getUserLevel';
import { getGarageState } from './getGarageState';
import { getUser } from './getUser';
import { getUsers } from './getUsers';
import { getVersion } from './getVersion';
import { press } from './press';
import { updateDeviceName } from './updateDeviceName';
import { installUpdate } from './installUpdate';
import { updateProfile } from './updateProfile';
import { updateUser } from './updateUser';
import { configureDNS } from './configureDNS';
import { ServerSocket } from 'types';

const listeners = [
  checkForNewVersion,
  configureCertificates,
  configureDNS,
  deleteUser,
  getCpuTemp,
  getDeviceName,
  getDiskSpace,
  getDnsInfo,
  getGarageState,
  getLogs,
  getNumNotifications,
  getUserLevel,
  getUser,
  getUsers,
  getVersion,
  installUpdate,
  press,
  updateDeviceName,
  updateProfile,
  updateUser,
];

export async function addEventListeners(socket: ServerSocket, id: string) {
  listeners.forEach(listener => listener(socket, id));
}
