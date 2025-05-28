import Observable from '../framework/observable.js';
import {updateItem} from '../utils';
import {UPDATE_TYPE} from '../const.js';

export default class PointModel extends Observable {
  #pointApiService = null;
  #points = [];
  #offersByType = {};
  #destinations = [];

  constructor({ pointApiService }) {
    super();
    this.#pointApiService = pointApiService;
  }

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offersByType;
  }

  get destinations() {
    return this.#destinations;
  }

  async init() {
    try {
      const [points, offers, destinations] = await Promise.all([
        this.#pointApiService.getPoints(),
        this.#pointApiService.getOffers(),
        this.#pointApiService.getDestinations(),
      ]);

      this.#offersByType = this.#transformOffers(offers);
      this.#destinations = destinations;
      this.#points = points.map(this.#adaptPoint);
      this._notify(UPDATE_TYPE.INIT);
    } catch (error) {
      this.#points = [];
      this.#offersByType = {};
      this.#destinations = [];
      throw error;
    }
  }

  #transformOffers(rawOffers) {
    if (!Array.isArray(rawOffers)) {
      return {};
    }
    return rawOffers.reduce((accumulator, group) => {
      accumulator[group.type] = group.offers;
      return accumulator;
    }, {});
  }

  #adaptPoint = (point) => {
    const adaptedPoint = {
      ...point,
      price: point['base_price'],
      dateFrom: new Date(point['date_from']),
      dateTo: new Date(point['date_to']),
      isFavorite: point['is_favorite'],
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];
    return adaptedPoint;
  };

  async addPoint(updateType, update) {
    const newPointRaw = await this.#pointApiService.addPoint(update);
    const newPointAdapted = this.#adaptPoint(newPointRaw);
    this.#points = [newPointAdapted, ...this.#points];
    this._notify(updateType, newPointAdapted);
    return newPointAdapted;
  }

  async updatePoint(updateType, point) {
    const updatedRaw = await this.#pointApiService.updatePoint(point);
    const updatedPoint = this.#adaptPoint(updatedRaw);
    this.#points = updateItem(this.#points, updatedPoint);
    this._notify(updateType, updatedPoint);
    return updatedPoint;
  }

  async deletePoint(updateType, point) {
    await this.#pointApiService.deletePoint(point);
    this.#points = this.#points.filter((item) => item.id !== point.id);
    this._notify(updateType, point);
  }
}
