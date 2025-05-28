import AbstractView from '../framework/view/abstract-view.js';

function createTripInfoTemplate({ route, dateRange, totalPrice }) {
  return `
    <section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${route}</h1>
        <p class="trip-info__dates">${dateRange}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalPrice}</span>
      </p>
    </section>
  `;
}

export default class TripInfoView extends AbstractView {
  #route = null;
  #dateRange = null;
  #totalPrice = null;

  constructor({ route, dateRange, totalPrice }) {
    super();
    this.#route = route;
    this.#dateRange = dateRange;
    this.#totalPrice = totalPrice;
  }

  get template() {
    return createTripInfoTemplate({
      route: this.#route,
      dateRange: this.#dateRange,
      totalPrice: this.#totalPrice,
    });
  }
}
