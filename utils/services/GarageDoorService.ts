import { GarageState } from '../enums';
import { WebSocketService } from './WebSocketService';
import { Gpio } from 'onoff';
import { LogService } from './LogService';
import { LogEvent } from '../types/LogEntry';
import { service } from './UsersService';

export class GarageDoorService {
  private static instance: GarageDoorService;
  private doorState: GarageState | undefined;

  private constructor() {
    if (process.env.NODE_ENV === 'development') this.changeState(GarageState.CLOSED);
    else {
      this.doorState = GarageState.FETCHING;
      const opener = new Gpio(18, 'in', 'both');
      const closer = new Gpio(16, 'in', 'both');
      opener.watch(this.openListener);
      closer.watch(this.closeListener);
      const openValue = opener.readSync();
      const closeValue = closer.readSync();
      if (!openValue && !closeValue) this.changeState(GarageState.UNKNOWN);
      else if (openValue) this.changeState(GarageState.OPEN);
      else this.changeState(GarageState.CLOSED);
    }
  }

  public static getInstance(): GarageDoorService {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (process.env.NODE_ENV === 'development') {
      if (!global.garageDoorServiceInstance) global.garageDoorServiceInstance = new GarageDoorService();
      return global.garageDoorServiceInstance;
    }

    if (!this.instance) this.instance = new GarageDoorService();
    return this.instance;
  }

  public getDoorState() {
    return this.doorState;
  }

  private openListener(_error: any, value: 0 | 1) {
    if (value === Gpio.LOW) this.changeState(GarageState.UNKNOWN);
    else this.changeState(GarageState.CLOSED);
  }

  private closeListener(_error: any, value: 0 | 1) {
    if (value === Gpio.LOW) this.changeState(GarageState.UNKNOWN);
    else this.changeState(GarageState.OPEN);
  }

  public pressButton(id: string) {
    const { id: userId, username, firstName, lastName } = service.getUser(id);
    LogService.getInstance().addEntry(LogEvent.PRESS, { userId, username, firstName, lastName });
    // If in development mode, just pick a random state
    if (process.env.NODE_ENV === 'development') {
      const randomState = Math.floor(Math.random() * (Object.keys(GarageState).length / 2 - 1));
      this.changeState(randomState);
    } else {
      try {
        const garageSwitch = new Gpio(14, 'out');
        garageSwitch.writeSync(Gpio.LOW);
        setTimeout(() => garageSwitch.writeSync(Gpio.HIGH), 1000);
      } catch (error: any) {
        console.error(error);
      }
    }
  }

  private changeState(state: GarageState) {
    if (state !== this.doorState) {
      WebSocketService.getInstance().notifyDoorState(state);
      LogService.getInstance().addEntry(LogEvent.STATE_CHANGE, { oldValue: this.doorState, newValue: state });
      this.doorState = state;
    }
  }
}

// Load the service immediately
GarageDoorService.getInstance();
