import { POINTS } from '../mock/event-mock';
import { OFFERS } from '../mock/offers-mock';
import { DESTINATIONS } from '../mock/destination-mock';

export default class PointsListModel {
  #points = [...POINTS];
  #offers = [...OFFERS];
  #destinations = [...DESTINATIONS];

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offers;
  }

  get destinations() {
    return this.#destinations;
  }
}
