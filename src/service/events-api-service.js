
import { METHOD } from '../const.js';
import ApiService from '../framework/api-service';


export default class EventsApiService extends ApiService {
  constructor(endPoint, authorization) {
    super(endPoint, authorization);
  }

  async getPoints() {
    const response = await this._load({ url: 'points', method: METHOD.GET });
    console.log('Raw points response:', response);
    const rawPoints = await EventsApiService.parseResponse(response);
    console.log('Parsed raw points:', rawPoints);
    return rawPoints.map(EventsApiService.adaptPointToClient);
  }

  async getDestinations() {
    const response = await this._load({ url: 'destinations', method: METHOD.GET });
    const parsedDestinations = await EventsApiService.parseResponse(response);
    console.log('Parsed destinations:', parsedDestinations);

    return parsedDestinations;
  }

  async getOffers() {
    const response = await this._load({ url: 'offers', method: METHOD.GET });
    return await EventsApiService.parseResponse(response); // Временно без адаптации
  }

  static adaptPointToClient(data) {
    return data;
  }

  static adaptDestinationToClient(data) {
    const adaptedData = {
      id: data['id'],
      name: data['name'],
      description: data['description'],
      pictures: data['pictures'].map((picture) => ({
        src: picture['src'],
        description: picture['description'],
      })),
    };

    delete adaptedData['pictures'];

    return adaptedData;
  }

  static adaptOfferToClient(data) {
    const adaptedData = {
      id: data['id'],
      title: data['title'],
      price: data['price'],
    };

    return adaptedData;
  }
}

/**
 * @typedef {Object} Point
 * @property {string} id
 * @property {string} type
 * @property {string} destination
 * @property {number} dateFrom
 * @property {number} dateTo
 * @property {number} basePrice
 * @property {Set<string>} offers
 */

/**
 * @typedef {Object} Destination
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {Array<Picture>} pictures
 */

/**
 * @typedef {Object} Picture
 * @property {string} src
 * @property {string} description
 */

/**
 * @typedef {Object} Offer
 * @property {string} id
 * @property {string} title
 * @property {number} price
 */
