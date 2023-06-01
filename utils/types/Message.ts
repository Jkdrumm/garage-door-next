import { GarageEvent, AdminLevel, GarageState } from '../enums';

export type Message =
  | { event: GarageEvent.ADMIN; message: AdminLevel }
  | { event: GarageEvent.ACKNOWLEDGEMNET; message?: null }
  | { event: GarageEvent.SESSION_TIMEOUT; message?: null }
  | { event: GarageEvent.STATE; message: GarageState };
