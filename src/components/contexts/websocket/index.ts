import type { ClientSocket } from 'types';
import type { QueryClient } from '@tanstack/react-query';
import { addDnsLoginCompleteListener } from './addDnsLoginCompleteListener';
import { addDnsLoginListener } from './addDnsLoginListener';
import { addGarageStateListener } from './addGarageStateListener';
import { addGettingCertificatesCompleteListener } from './addGettingCertificatesCompleteListener';
import { addGettingCertificatesListener } from './addGettingCertificatesListener';
import { addLiveLogListener } from './addLiveLogListener';
import { addNewUserListener } from './addNewUserListener';
import { addNewVersionCheckListener } from './addNewVersionCheckListener';
import { addSessionTimeoutListener } from './addSessionTimeoutListener';
import { addUpdateCompleteListener } from './addUpdateCompleteListener';
import { addUpdateUserListener } from './addUpdateUserListener';
import { addUpdateFailedListener } from './addUpdateFailedListener';
import { addUserDeletedListener } from './addUserDeletedListener';
import { addUserLevelListener } from './addUserLevelListener';
import { addVersionUpdate } from './addVersionUpdate';

const listeners = [
  addDnsLoginCompleteListener,
  addDnsLoginListener,
  addGarageStateListener,
  addGettingCertificatesCompleteListener,
  addGettingCertificatesListener,
  addLiveLogListener,
  addNewUserListener,
  addNewVersionCheckListener,
  addSessionTimeoutListener,
  addUpdateCompleteListener,
  addUpdateUserListener,
  addUpdateFailedListener,
  addUserDeletedListener,
  addUserLevelListener,
  addVersionUpdate,
];

export function addEventListeners(socket: ClientSocket, queryClient: QueryClient) {
  listeners.forEach(listener => listener(socket, queryClient));
}
