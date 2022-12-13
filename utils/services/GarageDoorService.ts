import { GarageState } from '../enums';
import { WebSocketService } from './WebSocketService';
import { Gpio } from 'onoff';
import { LogService } from './LogService';
import { LogEvent } from '../types/LogEntry';
import { UsersService } from './UsersService';

export class GarageDoorService {
  private doorState: GarageState | undefined;

  private constructor() {
    if (process.env.NODE_ENV === 'development') this.changeState(GarageState.CLOSED);
    else {
      this.doorState = GarageState.FETCHING;
      const opener = new Gpio(2, 'in', 'both');
      const closer = new Gpio(3, 'in', 'both');
      setInterval(() => {
        const openValue = opener.readSync();
        const closeValue = closer.readSync();
        console.log(openValue, closeValue);
        if (!openValue && !closeValue) this.changeState(GarageState.UNKNOWN);
        else if (openValue) this.changeState(GarageState.OPEN);
        else this.changeState(GarageState.CLOSED);
      }, 250);
      closer.watch((_, value) => console.log(value));
      // opener.watch((error: any, value: 0 | 1) => {
      //   if (error) console.error(error);
      //   if (value === Gpio.LOW) this.changeState(GarageState.UNKNOWN);
      //   else this.changeState(GarageState.CLOSED);
      // });
      // closer.watch((error: any, value: 0 | 1) => {
      //   if (error) console.error(error);
      //   if (value === Gpio.LOW) this.changeState(GarageState.UNKNOWN);
      //   else this.changeState(GarageState.OPEN);
      // });
      // const openValue = opener.readSync();
      // const closeValue = closer.readSync();
    }
  }

  /**
   * Get the Singleton instance of this class
   * @returns The singleton instance
   */
  public static getInstance(): GarageDoorService {
    if (!global.garageDoorServiceInstance) global.garageDoorServiceInstance = new GarageDoorService();
    return global.garageDoorServiceInstance;
  }

  /**
   * Gets the current state of the garage door
   * @returns The door state
   */
  public getDoorState() {
    return this.doorState;
  }

  /**
   * Handles pressing the garage door button.
   * @param id The id of the user that pressed the button
   */
  public pressButton(id: string) {
    const { id: userId, username, firstName, lastName } = UsersService.getInstance().getUser(id);
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

  /**
   * Changes the internal state of the garage door
   * @param state The state to change the door to
   */
  private changeState(state: GarageState) {
    console.log(`CHANGING TO ${GarageState[state]}`);
    if (state !== this.doorState) {
      WebSocketService.getInstance().notifyDoorState(state);
      LogService.getInstance().addEntry(LogEvent.STATE_CHANGE, { oldValue: this.doorState, newValue: state });
      this.doorState = state;
    }
  }
}

// Load the service immediately
GarageDoorService.getInstance();
