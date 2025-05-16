import Observable from '../framework/observable.js';
import { updateItem } from '../utils';
import { UPDATE_TYPE } from '../const.js';

export default class PointsListModel extends Observable {
  #pointsApiService = null;
  #points = [];
  #offersByType = {};
  #destinations = [];

  constructor({ pointsApiService }) {
    super();
    this.#pointsApiService = pointsApiService;
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
        this.#pointsApiService.getPoints(),
        this.#pointsApiService.getOffers(),
        this.#pointsApiService.getDestinations(),
      ]);

      this.#offersByType = this.#transformOffers(offers);
      this.#destinations = destinations;
      this.#points = points.map(this.#adaptPoint);

      this._notify(UPDATE_TYPE.INIT);
    } catch (e) {
      this.#points = [];
      this.#offersByType = {};
      this.#destinations = [];
      this._notify(UPDATE_TYPE.INIT);
      throw new Error('Failed to initialize PointsListModel');
    }
  }

  #transformOffers(rawOffers) {
    return rawOffers.reduce((acc, group) => {
      acc[group.type] = group.offers;
      return acc;
    }, {});
  }

  #adaptPoint = (point) => {
    const adapted = {
      ...point,
      price: point['base_price'],
      dateFrom: new Date(point['date_from']),
      dateTo: new Date(point['date_to']),
      isFavorite: point['is_favorite'],
      // destination remains an ID
      // offers remain an array of IDs
    };

    delete adapted['base_price'];
    delete adapted['date_from'];
    delete adapted['date_to'];
    delete adapted['is_favorite'];

    return adapted;
  };

  async addPoint(updateType, update) {
    const newPointRaw = await this.#pointsApiService.addPoint(update);
    const newPointAdapted = this.#adaptPoint(newPointRaw);
    this.#points = [newPointAdapted, ...this.#points];
    this._notify(updateType, newPointAdapted);
    return newPointAdapted;
  }

  async updatePoint(updateType, point) {
    try {
      const updatedRaw = await this.#pointsApiService.updatePoint(point);
      const updatedPoint = this.#adaptPoint(updatedRaw);
      this.#points = updateItem(this.#points, updatedPoint);
      this._notify(updateType, updatedPoint);
    } catch (err) {
      throw new Error('Error updating point');
    }
  }

  async deletePoint(updateType, point) {
    try {
      await this.#pointsApiService.deletePoint(point);
      this.#points = this.#points.filter((item) => item.id !== point.id);
      this._notify(updateType, point);
    } catch (err) {
      throw new Error('Error deleting point');
    }
  }
}
