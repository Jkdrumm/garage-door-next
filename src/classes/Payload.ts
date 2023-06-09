import { Message } from 'types';

/**
 * A data structure for sending websocket messages.
 */
export class Payload {
  private readonly payload: Message[];

  constructor(payload: Message[] = []) {
    this.payload = payload;
  }

  /**
   * Add a message to the payload.
   * @param message The message to add
   */
  public add(message: Message) {
    this.payload.push(message);
  }

  /**
   * Get the payload.
   * @returns The payload
   */
  public getPayload() {
    return this.payload;
  }
}
