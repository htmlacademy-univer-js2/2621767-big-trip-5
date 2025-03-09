import {getRandomEvent} from '../mock/event-mock.js';

const EVENT_COUNT = 9;

export default class EventsModel {
  events = Array.from({length: EVENT_COUNT}, getRandomEvent);

  getEvents() {
    return this.events;
  }
}
