import { Socket } from 'socket.io';

import { checkForNewVersion } from './checkForNewVersion';
import { configureCertificates } from './configureCertificates';
import { deleteUser } from './deleteUser';
import { getDnsInfo } from './getDnsInfo';
import { getLogs } from './getLogs';
import { getNumNotifications } from './getNumNotifications';
import { getUserLevel } from './getUserLevel';
import { getGarageState } from './getGarageState';
import { getUser } from './getUser';
import { getUsers } from './getUsers';
import { getVersion } from './getVersion';
import { press } from './press';
import { installUpdate } from './installUpdate';
import { updateProfile } from './updateProfile';
import { updateUser } from './updateUser';
import { configureDNS } from './configureDNS';

const listeners = [
  checkForNewVersion,
  configureCertificates,
  configureDNS,
  deleteUser,
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
  updateProfile,
  updateUser
];

export async function addEventListeners(socket: Socket, id: string) {
  listeners.forEach(listener => listener(socket, id));
}
