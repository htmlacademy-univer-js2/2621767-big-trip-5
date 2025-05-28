import { METHOD_TYPE } from '../const.js';
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
    const adaptedPoint = EventsApiService.adaptPointToServer(point);

    const response = await this._load({
      url: 'points',
      method: METHOD_TYPE.POST,
      body: JSON.stringify(adaptedPoint),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);
    return EventsApiService.adaptPointToClient(parsedResponse);
  }

  async deletePoint(point) {
    const response = await this._load({
      url: `points/${point.id}`,
      method: METHOD_TYPE.DELETE,
    });
    return response;
  }

  async updatePoint(point) {
    const adaptedPoint = EventsApiService.adaptPointToServer(point);
    const response = await this._load({
      url: `points/${point.id}`,
      method: METHOD_TYPE.PUT,
      body: JSON.stringify(adaptedPoint),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
    const parsedResponse = await ApiService.parseResponse(response);

    return EventsApiService.adaptPointToClient(parsedResponse);
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
