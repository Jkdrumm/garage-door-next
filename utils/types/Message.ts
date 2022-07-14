import { GarageEvent, AdminLevel, GarageState } from '../enums';

export type Message =
  | { event: GarageEvent.ADMIN; message: AdminLevel }
  | { event: GarageEvent.ACKNOWLEDGEMNET; message?: undefined }
  | { event: GarageEvent.SESSION_TIMEOUT; message?: undefined }
  | { event: GarageEvent.STATE; message: GarageState };
