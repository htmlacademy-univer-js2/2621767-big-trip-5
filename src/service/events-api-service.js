import {METHOD} from '../const.js';
import ApiService from '../framework/api-service';


export default class EventsApiService extends ApiService {
  constructor(endPoint, authorization) {
    super(endPoint, authorization);
  }

  async getPoints() {
    return this._load({ url: 'points' })
      .then(ApiService.parseResponse);
  }

  async getDestinations() {
    return this._load({ url: 'destinations' })
      .then(ApiService.parseResponse);
  }

  async getOffers() {
    return this._load({ url: 'offers' })
      .then(ApiService.parseResponse);
  }

  async addPoint(point) {
    const adaptedData = EventsApiService.adaptPointToServer(point);

    try { // <-- Добавляем try...catch
      const response = await this._load({
        url: 'points',
        method: METHOD.POST,
        body: JSON.stringify(adaptedData),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const parsed = await EventsApiService.parseResponse(response);
      return EventsApiService.adaptPointToClient(parsed);
    } catch (error) {
      throw error; // <-- Перебрасываем ошибку!
    }
  }

  async deletePoint(point) {
    try { // <-- Добавляем try...catch
      const response = await this._load({
        url: `points/${point.id}`,
        method: METHOD.DELETE,
      });

      // Здесь не нужна дополнительная проверка response.ok, так как _load уже это сделал
      // и выбросил бы ошибку, если response.ok было false.
      return response; // Возвращаем response (обычно для DELETE не нужен парсинг ответа)
    } catch (error) {
      // Перебрасываем ошибку, чтобы презентер мог её поймать
      throw error; // <-- Перебрасываем ошибку!
    }
  }

  async updatePoint(point) {
    const adaptedData = EventsApiService.adaptPointToServer(point);

    try { // <-- Добавляем try...catch
      const response = await this._load({
        url: `points/${point.id}`,
        method: METHOD.PUT,
        body: JSON.stringify(adaptedData),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
      const parsed = await ApiService.parseResponse(response);

      return EventsApiService.adaptPointToClient(parsed);
    } catch (error) {
      // Перебрасываем ошибку, чтобы презентер мог её поймать
      throw error; // <-- Перебрасываем ошибку!
    }
  }

  static adaptPointToClient(data) {
    return data;
  }

  static adaptPointToServer(point) {
    return {
      'id': point.id,
      'type': point.type,
      'destination': point.destination,
      'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : point.dateFrom,
      'date_to': point.dateTo instanceof Date ? point.dateTo.toISOString() : point.dateTo,
      'base_price': point.price,
      'is_favorite': point.isFavorite,
      'offers': point.offers,
    };
  }
}
