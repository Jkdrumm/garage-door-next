import { Message } from '../types';

export class Payload {
  private readonly payload: Message[];

  constructor(payload: Message[] = []) {
    this.payload = payload;
  }

  public add(message: Message) {
    this.payload.push(message);
  }

  public getPayload() {
    return this.payload;
  }
}
