import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import {getFullDate, getOffersByType} from '../utils';
import {EVENT_TYPE, FORM_TYPE, POINT} from '../const';
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

function makeFormEditingTemplate(state, destinations = [], allOffers = [], formType = []) {
  const {id, type, destination, dateFrom, dateTo, price, offers} = state.event;
  const {isDisabled, isSaving, isDeleting} = state;

  let pointDestination = destinations.find((dest) => dest?.id === destination);

  if (!pointDestination) {
    pointDestination = {
      id: null,
      name: '',
      description: '',
      pictures: [],
    };
  }

  const fullStartDate = dateFrom ? getFullDate(dateFrom) : '';
  const fullEndDate = dateTo ? getFullDate(dateTo) : '';
  const availableOffers = getOffersByType(type, allOffers);
  const pointTypeIsChecked = (eventType) => eventType === type ? 'checked' : '';
  const deleteMessage = isDeleting ? 'Deleting...' : 'Delete';
  const savingMessage = isSaving ? 'Saving...' : 'Save';

  const hasDestinationInfo = pointDestination?.description || pointDestination?.pictures?.length > 0;
  const hasPhotos = pointDestination?.pictures?.length > 0;

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
                      ${EVENT_TYPE.map((eventType) => `<div class="event__type-item">
                        <input id="event-type-${eventType}-1" class="event__${eventType}-input  visually-hidden" type="radio" name="event-type" value="${eventType}" ${pointTypeIsChecked(eventType)}>
                        <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-1">${eventType}</label>
                      </div>`).join('')}
                    </fieldset>
                  </div>
                </div>

                <div class="event__field-group event__field-group--destination">
                  <label class="event__label event__type-output" for="event-destination-${id || 'new'}">
                    ${type}
                  </label>
                  <input
                    class="event__input event__input--destination"
                    id="event-destination-${id || 'new'}"
                    list="destinations-list-${id || 'new'}"
                    name="event-destination"
                    value="${pointDestination?.name || ''}"
                    placeholder="Выберите или введите пункт назначения"
                  >
                  <datalist id="destinations-list-${id || 'new'}">
                    ${destinations.map((dest) => `<option value="${dest.name}"></option>`).join('')}
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
                  <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${price}">
                </div>

                <button class="event__save-btn btn btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${savingMessage}</button>
                <button class="event__reset-btn" type="button">${formType === FORM_TYPE.EDIT ? deleteMessage : 'Cancel'}</button>
                ${formType === FORM_TYPE.EDIT ? `<button class="event__rollup-btn" type="button">
                    <span class="visually-hidden">Open event</span>
                </button>` : ''}
              </header>
              <section class="event__details">
                ${(availableOffers.length !== 0) ? `
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                    <div class="event__available-offers">
                      ${availableOffers.map((option) => createOfferTemplate(option, offers)).join('')}
                    </div>
                  </section>` : ''}
                ${hasDestinationInfo ? `
                <section class="event__section  event__section--destination">
                  <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                  ${pointDestination?.description ? `<p class="event__destination-description">${pointDestination.description}</p>` : ''}
                  ${hasPhotos ? `
                  <div class="event__photos-container">
                    <div class="event__photos-tape">
                      ${pointDestination.pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.alt}">`).join('')}
                    </div>
                  </div>` : ''}
                </section>` : ''}
              </section>
            </form>
          </li>`;
}

export default class FormEditing extends AbstractStatefulView {
  #handleFormSubmit = null;
  #destinations = null;
  #offers = null;
  #onRollButtonClick = null;
  #datepickerStart = null;
  #handleDeleteClick = null;
  #datepickerEnd = null;
  #onResetClick = null;
  #onDeleteClick = null;
  #onFormClose = null;
  #type;

  constructor({event = POINT, destinations, offers, onRollButtonClick, onSubmitButtonClick, onDeleteClick, onResetClick, onFormClose, type = FORM_TYPE.EDIT}) {
    super();
    this._setState({event});
    this.#destinations = destinations || [];
    this.#offers = offers || [];
    this.#onRollButtonClick = onRollButtonClick;
    this.#handleFormSubmit = onSubmitButtonClick;
    this.#handleDeleteClick = onDeleteClick;
    this.#onDeleteClick = onDeleteClick;
    this.#onResetClick = onResetClick;
    this.#onFormClose = onFormClose;
    this.#type = type;
    this._restoreHandlers();
  }


  get template() {
    return makeFormEditingTemplate(this._state, this.#destinations, this.#offers, this.#type);
  }

  reset = (event) => this.updateElement({event});

  #onSubmitButtonElementClick = (evt) => {
    evt.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    const pointToSave = this.#parseStateToPoint();

    if (!this.#validatePointData(pointToSave)) {
      this.shake();
      return;
    }

    console.log('Sending point data:', pointToSave); // <--- ADD THIS LINE

    this.updateElement({
      isDisabled: true,
      isSaving: true,
    });

    this.#handleFormSubmit(pointToSave);
  };

  #validatePointData = (point) => point.destination &&
    point.destination !== 'unknown' &&
    point.price > 0 &&
    point.dateFrom &&
    point.dateTo &&
    point.dateFrom < point.dateTo;

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
        price: Number(event.target.value),
      }
    });
  };

  #onOffersChange = (event) => {
    const offerId = event.target.value;
    const currentOffers = [...this._state.event.offers];
    const normalizedId = isNaN(Number(offerId)) ? offerId : Number(offerId);

    this.updateElement({
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
    const selectedDestination = this.#destinations.find((dest) => dest.name === cityName);

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

  #onDeleteButtonClick = (event) => { // The method is no longer async
    event.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    // The view should not handle the try-catch logic.
    // It just updates its state and notifies the presenter.
    this.updateElement({
      isDisabled: true,
      isDeleting: true,
    });

    // Delegate the delete action to the presenter without 'await'
    this.#handleDeleteClick(this._state.event);
  };

  #onDateEndCloseButton = ([date]) => {
    this._setState({
      event: {
        ...this._state.event,
        dateTo: date,
      }
    });
    this.#datepickerStart.set('maxDate', this._state.event.dateTo);
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
    if (!formNode) return;

    const destInput = formNode.querySelector('.event__input--destination');
    const priceInput = formNode.querySelector('.event__input--price');
    const dateFromInput = formNode.querySelector('[name="event-start-time"]');
    const dateToInput = formNode.querySelector('[name="event-end-time"]');
    const saveButton = formNode.querySelector('.event__save-btn');

    if (!destInput || !priceInput || !dateFromInput || !dateToInput || !saveButton) return;

    const destValue = destInput.value.trim();
    const priceValue = Number(priceInput.value);
    const dateFrom = dateFromInput.value;
    const dateTo = dateToInput.value;

    const isValid = priceValue > 0 &&
      destValue &&
      dateFrom &&
      dateTo &&
      this.#destinations.some(dest => dest.name === destValue);

    saveButton.disabled = !isValid || this._state.isDisabled;
  };

  #parseStateToPoint = () => {
    const point = {
      ...this._state.event,
      destination: this._state.event.destination === undefined ? 'unknown' : this._state.event.destination,
      price: Number(this._state.event.price) || 0,
      offers: Array.isArray(this._state.event.offers) ? this._state.event.offers : [],
      dateFrom: this._state.event.dateFrom,
      dateTo: this._state.event.dateTo
    };

    return point;
  };

  _restoreHandlers() {
    if (this.#type === FORM_TYPE.EDIT) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#onRollButtonElementClick);
      this.element.querySelector('.event__reset-btn').addEventListener('click', this.#onDeleteButtonClick);
    }
    if (this.#type === FORM_TYPE.CREATE) {
      this.element.querySelector('.event__reset-btn').addEventListener('click', (evt) => {
        evt.preventDefault();
        this.#onResetClick?.(); // это вызовет this.#handleReset в NewEventPresenter
      });
    }
    this.element.querySelector('.event--edit').addEventListener('submit', this.#onSubmitButtonElementClick);
    this.element.querySelector('.event--edit').addEventListener('input', this.#formValidation);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#changePointType);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#onPriceChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#onDestinationChange);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((element) =>
      element.addEventListener('change', this.#onOffersChange));
    this.#formValidation();
    this.#setDatepickers();
    if (this.element) {
      const form = this.element.querySelector('.event--edit');
      if (form) {
        this.#formValidation({ target: form });
      }
    }
  }
}
