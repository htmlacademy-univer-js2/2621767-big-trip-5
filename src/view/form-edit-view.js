import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {getFullDate, getOffersByType} from '../utils.js';
import { EVENT_TYPES } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const FLATPICKR_CONFIG = {
  dateFormat: 'd/m/y H:i',
  enableTime: true,
  locale: {
    firstDayOfWeek: 1,
  },
  'time_24hr': true,
};

function createOfferTemplate(offer, pointOffers) {
  const {id, title, price} = offer;
  const isOptionChecked = pointOffers.map(String).includes(String(id));

  return `<div class="event__offer-selector">
             <input class="event__offer-checkbox  visually-hidden" id="event-offer-${id}-1" type="checkbox" name="event-offer-${id}" value="${id}" ${isOptionChecked ? 'checked' : ''}>
             <label class="event__offer-label" for="event-offer-${id}-1">
               <span class="event__offer-title">${title}</span>
               &plus;&euro;&nbsp;
               <span class="event__offer-price">${price}</span>
             </label>
           </div>`;
}

function makeFormEditingTemplate(state, destinations = [], allOffers = []) {
  const {id, type, destination, dateFrom, dateTo, basePrice, offers} = state.event;

  const pointDestination = destinations.find((dest) => dest.id === destination) || {
    id: destination.id,
    city: destination.city,
    description: destination.description,
    pictures: destination.pictures,
  };
  const fullStartDate = getFullDate(dateFrom);
  const fullEndDate = getFullDate(dateTo);
  const availableOffers = getOffersByType(type, allOffers);

  const pointTypeIsChecked = (eventType) => eventType === type ? 'checked' : '';

  return `<li class="trip-events__item">
            <form class="event event--edit" action="#" method="post">
              <header class="event__header">
                <div class="event__type-wrapper">
                  <label class="event__type  event__type-btn" for="event-type-toggle-1">
                    <span class="visually-hidden">Choose event type</span>
                    <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                  </label>
                  <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

                  <div class="event__type-list">
                    <fieldset class="event__type-group">
                      <legend class="visually-hidden">Event type</legend>
                      ${EVENT_TYPES.map((eventType) => `<div class="event__type-item">
                        <input id="event-type-${eventType}-1" class="event__${eventType}-input  visually-hidden" type="radio" name="event-type" value="${eventType}" ${pointTypeIsChecked(eventType)}>
                        <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-1">${eventType}</label>
                      </div>`).join('')}
                    </fieldset>
                  </div>
                </div>

                <div class="event__field-group  event__field-group--destination">
                  <label class="event__label  event__type-output" for="event-destination-${id}">
                    ${type}
                  </label>
                  <input class="event__input  event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${pointDestination.city}" list="destination-list-1">
                  <datalist id="destination-list-${id}">
                    ${destinations.map((dest) => `<option value="${dest.city}"></option>`).join('')}
                  </datalist>
                </div>

                <div class="event__field-group  event__field-group--time">
                  <label class="visually-hidden" for="event-start-time-1">From</label>
                  <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${fullStartDate}">
                  &mdash;
                  <label class="visually-hidden" for="event-end-time-1">To</label>
                  <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${fullEndDate}">
                </div>

                <div class="event__field-group  event__field-group--price">
                  <label class="event__label" for="event-price-1">
                    <span class="visually-hidden">Price</span>
                    &euro;
                  </label>
                  <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
                </div>

                <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
                <button class="event__reset-btn" type="reset">Delete</button>
                <button class="event__rollup-btn" type="button">
                  <span class="visually-hidden">Open event</span>
                </button>
              </header>
              <section class="event__details">
                ${(availableOffers.length !== 0) ? `
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                    <div class="event__available-offers">
                      ${availableOffers.map((option) => createOfferTemplate(option, offers)).join('')}
                    </div>
                  </section>` : ''}
                <section class="event__section  event__section--destination">
                  <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                  <p class="event__destination-description">${pointDestination.description}</p>
                  <div class="event__photos-container">
                    <div class="event__photos-tape">
                      ${pointDestination.pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.alt}">`).join('')}
                    </div>
                  </div>
                </section>
              </section>
            </form>
          </li>`;
}

export default class FormEditing extends AbstractStatefulView {
  #event = null;
  #handleFormSubmit = null;
  #destinations = null;
  #offers = null;
  #onRollButtonClick = null;
  #onSubmitButtonClick = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  constructor({event, destinations, offers, onRollButtonClick, onSubmitButtonClick}) {
    super();
    this._setState({event});
    this.#destinations = destinations || [];
    this.#offers = offers || [];
    this.#onRollButtonClick = onRollButtonClick;
    this.#handleFormSubmit = onSubmitButtonClick;
    this._restoreHandlers();
  }

  get template() {
    return makeFormEditingTemplate(this._state, this.#destinations, this.#offers);
  }

  reset = (event) => this.updateElement({event});

  #onSubmitButtonElementClick = (event) => {
    event.preventDefault();
    this.#handleFormSubmit(this.#parseStateToPoint());
  };

  #changePointType = (event) => {
    this.updateElement({
      event: {
        ...this._state.event,
        type: event.target.value,
        offers: [],
      }
    });
  };

  #onPriceChange = (event) => {
    this._setState({
      event: {
        ...this._state.event,
        basePrice: Number(event.target.value),
      }
    });
  };

  #onOffersChange = (event) => {
    const offerId = event.target.value;
    const currentOffers = [...this._state.event.offers];

    const normalizedId = isNaN(Number(offerId)) ? offerId : Number(offerId);

    this._setState({
      event: {
        ...this._state.event,
        offers: currentOffers.includes(normalizedId)
          ? currentOffers.filter((id) => id !== normalizedId)
          : [...currentOffers, normalizedId]
      }
    });
  };

  #onDestinationChange = (event) => {
    const cityName = event.target.value;
    const selectedDestination = this.#destinations.find((dest) => dest.city === cityName);

    this.updateElement({
      event: {
        ...this._state.event,
        destination: selectedDestination?.id || 'unknown'
      }
    }, () => {
      this.#formValidation();
    });
  };

  #onRollButtonElementClick = (event) => {
    event.preventDefault();
    this.#onRollButtonClick();
  };

  #onDateEndCloseButton = ([date]) => {
    this._setState({
      event: {
        ...this._state.event,
        endDatetime: date,
      }
    });
    this.#datepickerStart.set('maxDate', this._state.event.endDatetime);
  };

  #setDatepickers = () => {
    const [dateStartElement, dateEndElement] = this.element.querySelectorAll('.event__input--time');

    this.#datepickerStart = flatpickr(dateStartElement, {
      ...FLATPICKR_CONFIG,
      defaultDate: this._state.event.dateFrom,
      onClose: this.#onDateStartCloseButton,
      maxDate: this._state.event.dateTo,
    });

    this.#datepickerEnd = flatpickr(dateEndElement, {
      ...FLATPICKR_CONFIG,
      defaultDate: this._state.event.dateTo,
      onClose: this.#onDateEndCloseButton,
      minDate: this._state.event.dateFrom,
    });
  };

  #onDateStartCloseButton = ([date]) => {
    this._setState({
      event: {
        ...this._state.event,
        dateFrom: date
      }
    });
    this.#datepickerEnd.set('minDate', date);
  };

  removeElement = () => {
    super.removeElement();

    if(this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }
    if(this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  };

  #formValidation = () => {
    const formNode = this.element.querySelector('form');
    const destInput = this.element.querySelector('.event__input--destination');
    const priceInput = this.element.querySelector('.event__input--price');
    const dateFromInput = this.element.querySelector('[name="event-start-time"]');
    const dateToInput = this.element.querySelector('[name="event-end-time"]');

    const destValue = destInput.value;
    const priceValue = priceInput.value;
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;

    const isDurationValid = dateFrom && dateTo;
    const isValid = priceValue && Number(priceValue) > 0 && destValue && isDurationValid;

    formNode.querySelector('.event__save-btn').disabled = !isValid;
  };


  #parseStateToPoint = () => {
    const point = {
      ...this._state.event,
      destination: this._state.event.destination || 'unknown',
      basePrice: Number(this._state.event.basePrice) || 0,
      offers: Array.isArray(this._state.event.offers)
        ? this._state.event.offers
        : [],
      dateFrom: this._state.event.dateFrom,
      dateTo: this._state.event.dateTo
    };

    if (!point.offers.every((offer) => typeof offer === 'string' || typeof offer === 'number')) {
      point.offers = [];
    }

    return point;
  };

  _restoreHandlers = () => {
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#onRollButtonElementClick);
    this.element.querySelector('.event--edit').addEventListener('submit', this.#onSubmitButtonElementClick);
    this.element.querySelector('.event--edit').addEventListener('input', this.#formValidation);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#changePointType);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#onPriceChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#onDestinationChange);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((element) =>
      element.addEventListener('change', this.#onOffersChange));
    this.#formValidation();
    this.#setDatepickers();
  };
}
