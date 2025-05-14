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
    const [points, offers, destinations] = await Promise.all([
      this.#pointsApiService.getPoints(),
      this.#pointsApiService.getOffers(),
      this.#pointsApiService.getDestinations(),
    ]);

    if (!Array.isArray(offers)) {
      throw new Error('Offers should be an array');
    }

    this.#points = points.map(this.#adaptPoint);
    this.#offersByType = this.#transformOffers(offers);
    this.#destinations = destinations;

    this._notify(UPDATE_TYPE.INIT, null);
  }

  #transformOffers(rawOffers) {
    return rawOffers.reduce((acc, offerGroup) => {
      acc[offerGroup.type] = offerGroup.offers;
      return acc;
    }, {});
  }

  #adaptPoint(point) {
    const adaptedPoint = {
      ...point,
      price: point['base_price'],
      dateFrom: new Date(point['date_from']),
      dateTo: new Date(point['date_to']),
      isFavorite: point['is_favorite'],
      offers: point['offers'] ?? [],
      destination: point['destination']
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }

  async addPoint(updateType, point) {
    this.#points = [point, ...this.#points];
    this._notify(updateType, point);
  }

  async updatePoint(updateType, point) {
    const updatedRaw = await this.#pointsApiService.updatePoint(point);
    const updatedPoint = this.#adaptPoint(updatedRaw);
    this.#points = updateItem(this.#points, updatedPoint);
    this._notify(updateType, updatedPoint);
  }


  async deletePoint(updateType, point) {
    this.#points = this.#points.filter((pointItem) => pointItem.id !== point.id);
    this._notify(updateType, point);
  }
}
