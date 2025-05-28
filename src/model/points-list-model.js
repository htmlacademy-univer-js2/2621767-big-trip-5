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

      // Уведомляем о успешной инициализации только здесь
      this._notify(UPDATE_TYPE.INIT);
    } catch (e) {
      console.error('PointsListModel: Failed to initialize data:', e); // Добавляем логирование ошибки
      this.#points = [];
      this.#offersByType = {};
      this.#destinations = [];
      // === ИЗМЕНЕНИЕ ЗДЕСЬ: НЕ ВЫЗЫВАЕМ this._notify(UPDATE_TYPE.INIT) при ошибке ===
      // Вместо этого, просто перебрасываем ошибку дальше,
      // чтобы BoardPresenter мог её поймать и обработать соответствующим образом.
      throw e;
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
    try { // Добавляем try...catch для надежности
      const newPointRaw = await this.#pointsApiService.addPoint(update);
      const newPointAdapted = this.#adaptPoint(newPointRaw);
      this.#points = [newPointAdapted, ...this.#points];
      this._notify(updateType, newPointAdapted);
      return newPointAdapted;
    } catch (err) {
      console.error('PointsListModel: Error adding point:', err); // Логируем ошибку
      throw err; // Перебрасываем ошибку дальше
    }
  }

  async updatePoint(updateType, point) {
    try {
      const updatedRaw = await this.#pointsApiService.updatePoint(point);
      const updatedPoint = this.#adaptPoint(updatedRaw);
      this.#points = updateItem(this.#points, updatedPoint);
      this._notify(updateType, updatedPoint);
      return updatedPoint; // Добавляем возврат обновленной точки
    } catch (err) {
      console.error('PointsListModel: Error updating point:', err); // Логируем ошибку
      throw err;
    }
  }

  async deletePoint(updateType, point) {
    try {
      await this.#pointsApiService.deletePoint(point);
      this.#points = this.#points.filter((item) => item.id !== point.id);
      this._notify(updateType, point);
    } catch (err) {
      console.error('PointsListModel: Error deleting point:', err); // Логируем ошибку
      throw err;
    }
  }
}
