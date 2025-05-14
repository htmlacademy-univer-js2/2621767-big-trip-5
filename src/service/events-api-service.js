import {METHOD} from '../const.js';
import ApiService from '../framework/api-service';


export default class EventsApiService extends ApiService {
  constructor(endPoint, authorization) {
    super(endPoint, authorization);
  }

  async getPoints() {
    const response = await this._load({ url: 'points', method: METHOD.GET });
    const rawPoints = await EventsApiService.parseResponse(response);
    return rawPoints.map(EventsApiService.adaptPointToClient);
  }

  async getDestinations() {
    const response = await this._load({ url: 'destinations', method: METHOD.GET });
    return await EventsApiService.parseResponse(response);
  }

  async getOffers() {
    const response = await this._load({ url: 'offers', method: METHOD.GET });
    return await EventsApiService.parseResponse(response);
  }

  async updatePoint(point) {

    const adaptedData = EventsApiService.adaptPointToServer(point);

    const response = await this._load({
      url: `points/${point.id}`,
      method: METHOD.PUT,
      body: JSON.stringify(adaptedData),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsed = await EventsApiService.parseResponse(response);

    return EventsApiService.adaptPointToClient(parsed);
  }

  static adaptPointToClient(data) {
    return data;
  }

  static adaptPointToServer(point) {
    return {
      'id': point.id,
      'type': point.type,
      'destination': point.destination,
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'base_price': point.price,
      'is_favorite': point.isFavorite,
      'offers': point.offers,
    };
  }
}
