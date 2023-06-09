import { Socket } from 'socket.io-client';
import { QueryClient } from '@tanstack/react-query';
import { addGarageStateListener } from './addGarageStateListener';
import { addLiveLogListener } from './addLiveLogListener';
import { addNewUserListener } from './addNewUserListener';
import { addTimeoutListener } from './addTimeoutListener';
import { addUpdateCompleteListener } from './addUpdateCompleteListener';
import { addUpdateUserListener } from './addUpdateUserListener';
import { addUpdateFailedListener } from './addUpdateFailedListener';
import { addUserDeletedListener } from './addUserDeletedListener';
import { addUserLevelListener } from './addUserLevelListener';

const listeners = [
  addGarageStateListener,
  addLiveLogListener,
  addNewUserListener,
  addTimeoutListener,
  addUpdateCompleteListener,
  addUpdateUserListener,
  addUpdateFailedListener,
  addUserDeletedListener,
  addUserLevelListener
];

export function addEventListeners(socket: Socket, queryClient: QueryClient) {
  listeners.forEach(listener => listener(socket, queryClient));
}
