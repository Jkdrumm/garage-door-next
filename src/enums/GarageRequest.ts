/**
 * The available actions for the garage
 */
export type GarageRequestType =
  | 'CHECK_FOR_NEW_VERSION'
  | 'CONFIGURE_CERTIFICATES'
  | 'CONFIGURE_DNS'
  | 'DELETE_USER'
  | 'GET_DNS_INFO'
  | 'GET_GARAGE_STATE'
  | 'GET_LOGS'
  | 'GET_NUM_NOTIFICATIONS'
  | 'GET_USER'
  | 'GET_USER_LEVEL'
  | 'GET_USERS'
  | 'GET_VERSION'
  | 'INSTALL_UPDATE'
  | 'PRESS'
  | 'UPDATE_PROFILE'
  | 'UPDATE_USER';
