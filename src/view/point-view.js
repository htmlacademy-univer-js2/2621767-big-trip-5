import AbstractView from '../framework/view/abstract-view.js';
import { formatEventTime, formatEventDate, formatEventDuration } from '../utils.js';

function createPointRouteTemplate(event, destinations, allOffers) {
  const {
    destination = '',
    dateFrom = new Date(),
    dateTo = new Date(),
    basePrice = 0,
    isFavorite = false,
    type = 'flight'
  } = event;

  const eventType = validateEventType(type);
  const eventTypeOffers = allOffers.find((offerGroup) => offerGroup.type === eventType)?.offers || [];

  const selectedOffers = eventTypeOffers.filter((offer) =>
    event.offers.some((id) => id === offer.id) // Нестрогое сравнение для разных типов
  );

  function validateEventType(objecttype) {
    const validTypes = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];
    const defaultType = 'flight';

    const normalizedType = String(objecttype).toLowerCase();
    return validTypes.includes(normalizedType) ? normalizedType : defaultType;
  }

  const pointDestination = destinations.find((dest) => dest.id === destination) || {
    id: destination.id,
    city: destination.city,
    description: destination.description,
    pictures: destination.pictures,
  };

  const startDate = formatEventDate(dateFrom);
  const startTime = formatEventTime(dateFrom);
  const endTime = formatEventTime(dateTo);
  const duration = formatEventDuration(dateFrom, dateTo);
  const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

  return `<li class="trip-events__item">
              <div class="event">
                <time class="event__date" datetime="${dateFrom.toISOString()}">${startDate}</time>
                <div class="event__type">
                  <img class="event__type-icon" width="42" height="42"
                       src="img/icons/${eventType}.png"
                       alt="Event type icon">
                </div>
                <h3 class="event__title">${eventType} ${pointDestination.city}</h3>
                <div class="event__schedule">
                  <p class="event__time">
                    <time class="event__start-time" datetime="${dateFrom.toISOString()}">${startTime}</time>
                    &mdash;
                    <time class="event__end-time" datetime="${dateTo.toISOString()}">${endTime}</time>
                  </p>
                  <p class="event__duration">${duration}</p>
                </div>
                <p class="event__price">
                  &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
                </p>
                ${selectedOffers.length > 0 ? `
          <section class="event__section event__section--offers">
            <h4 class="visually-hidden">Offers:</h4>
            <ul class="event__selected-offers">
              ${selectedOffers.map((offer) => `
                <li class="event__offer">
                  <span class="event__offer-title">${offer.title}</span>
                  &plus;&euro;&nbsp;
                  <span class="event__offer-price">${offer.price}</span>
                </li>
              `).join('')}
            </ul>
          </section>
        ` : ''}

                <button class="event__favorite-btn ${favoriteClass}" type="button">
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

export default class Point extends AbstractView {
  #event = null;
  #destinations = null;
  #offers = null;
  #handleEditClick = null;
  #handleFavoriteClick = null;

  constructor({event, destinations, offers, onEditClick, onFavoriteClick}) {
    super();
    this.#event = event;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleEditClick = onEditClick;
    this.#handleFavoriteClick = onFavoriteClick;

    // Add event listeners safely
    this.element.querySelector('.event__rollup-btn')?.addEventListener('click', this.#editClickHandler);
    this.element.querySelector('.event__favorite-btn')?.addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createPointRouteTemplate(this.#event, this.#destinations, this.#offers);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };
}
