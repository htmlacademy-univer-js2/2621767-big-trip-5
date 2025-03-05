import { createElement } from '../render.js';
import {formatEventTime} from '../utils.js';
import {formatEventDate} from '../utils.js';
import {getDestinationById} from '../utils.js';
import {getOffersByType} from '../utils.js';
import {formatEventDuration} from '../utils.js';

function createPointRouteTemplate(event) {
  const {startDate, endDate, type, price, isFavourite} = event;

  const startTime = formatEventTime(startDate);
  const endTime = formatEventTime(endDate);

  const date = formatEventDate(startDate);

  const destination = getDestinationById(event);
  const destinationName = destination.cityName;

  const offers = getOffersByType(event);
  const selectedOffers = offers
    .filter((offer) => event.offers.includes(offer.id))
    .map((offer) => `
      <li class="event__offer">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </li>
    `)
    .join('');

  const duration = formatEventDuration(startDate, endDate);

  const isFavouriteEvent = isFavourite ? 'event__favorite-btn--active' : '';

  return `<li class="trip-events__item">
              <div class="event">
                <time class="event__date" datetime="2019-03-18">${date}</time>
                <div class="event__type">
                  <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
                </div>
                <h3 class="event__title">${type} ${destinationName}</h3>
                <div class="event__schedule">
                  <p class="event__time">
                    <time class="event__start-time" datetime="2019-03-18T10:30">${startTime}</time>
                    &mdash;
                    <time class="event__end-time" datetime="2019-03-18T11:00">${endTime}</time>
                  </p>
                  <p class="event__duration">${duration}</p>
                </div>
                <p class="event__price">
                  &euro;&nbsp;<span class="event__price-value">${price}</span>
                </p>
                <h4 class="visually-hidden">Offers:</h4>
                <ul class="event__selected-offers">
                  ${selectedOffers}
                </ul>
                <button class="event__favorite-btn ${isFavouriteEvent}" type="button">
                  <span class="visually-hidden">Add to favorite</span>
                  <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                    <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
                  </svg>
                </button>
                <button class="event__rollup-btn" type="button">
                  <span class="visually-hidden">Open event</span>
                </button>
              </div>
           </li>`;
}

export default class PointRoute {
  constructor({event}) {
    this.event = event;
  }

  getTemplate() {
    return createPointRouteTemplate(this.event);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
