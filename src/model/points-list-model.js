import { POINTS } from '../mock/event-mock';
import { OFFERS } from '../mock/offers-mock';
import { DESTINATIONS } from '../mock/destination-mock';
import Observable from '../framework/observable.js';
import { updateItem } from '../utils';

export default class PointsListModel extends Observable {
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

  addPoint(updateType, point) {
    this.#points.push(point);
    this._notify(updateType, point);
  }

  updatePoint(updateType, point) {
    this.#points = updateItem(this.#points, point);
    this._notify(updateType, point);
  }

  deletePoint(updateType, point) {
    this.#points = this.#points.filter((pointItem) => pointItem !== null && pointItem.id !== point.id);
    this._notify(updateType, point);
  }
}
