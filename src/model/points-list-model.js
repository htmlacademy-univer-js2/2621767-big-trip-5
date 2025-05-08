import Observable from '../framework/observable.js';
import { updateItem } from '../utils';
import { UPDATE_TYPE } from '../const.js';

export default class PointsListModel extends Observable {
  #pointsApiService = null;
  #points = [];
  #offersByType = {}; // Изменяем название для ясности
  #destinations = []; // Массив для хранения пунктов назначения

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
      // Загружаем данные о событиях, предложениях и пунктах назначения
      const [points, offers, destinations] = await Promise.all([
        this.#pointsApiService.getPoints(),
        this.#pointsApiService.getOffers(),
        this.#pointsApiService.getDestinations() // Получаем данные о пунктах назначения
      ]);

      // Проверка структуры данных предложений
      if (!Array.isArray(offers)) {
        throw new Error('Offers should be an array');
      }

      // Преобразуем все данные и сохраняем их
      this.#points = points.map(this.#adaptPoint);
      this.#offersByType = this.#transformOffers(offers);
      this.#destinations = destinations; // Сохраняем полученные пункты назначения

      console.log('Model initialized:', {
        points: this.#points.length,
        offers: Object.keys(this.#offersByType).length,
        destinations: this.#destinations.length, // Выводим количество пунктов назначения
      });

      // Уведомляем подписчиков об успешной инициализации
      this._notify(UPDATE_TYPE.INIT, null);
    } catch (err) {
      console.error('Error initializing PointsListModel:', err);
    }
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

    // Удаляем старые поля
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
    this.#points = updateItem(this.#points, point);
    this._notify(updateType, point);
  }

  async deletePoint(updateType, point) {
    this.#points = this.#points.filter((pointItem) => pointItem.id !== point.id);
    this._notify(updateType, point);
  }
}
