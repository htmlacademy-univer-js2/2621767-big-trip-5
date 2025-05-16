import { render, replace, remove } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';

export default class TripInfoPresenter {
  #container = null;
  #pointsModel = null;
  #tripInfoComponent = null;

  constructor({ container, pointsModel }) {
    this.#container = container;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelChange);
  }

  init() {
    const points = [...this.#pointsModel.points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

    if (points.length === 0) {
      return;
    }

    const route = this.#getRoute(points);
    const dateRange = this.#getDateRange(points);
    const totalPrice = this.#getTotalPrice(points);

    const prevComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripInfoView({ route, dateRange, totalPrice });

    if (!prevComponent) {
      render(this.#tripInfoComponent, this.#container, 'afterbegin');
    } else {
      replace(this.#tripInfoComponent, prevComponent);
      remove(prevComponent);
    }
  }

  #handleModelChange = () => {
    this.init();
  };

  #getRoute(points) {
    const destinations = this.#pointsModel.destinations;

    const cities = points.map((point) => {
      const dest = destinations.find((d) => d.id === point.destination);
      return dest ? dest.name : 'Unknown';
    });

    if (cities.length <= 3) {
      return cities.join(' — ');
    }

    return `${cities[0]} — ... — ${cities[cities.length - 1]}`;
  }

  #getDateRange(points) {
    const start = new Date(points[0].dateFrom);
    const end = new Date(points[points.length - 1].dateTo);

    return `${start.getDate()} ${start.toLocaleString('en', { month: 'short' })} — ${end.getDate()} ${end.toLocaleString('en', { month: 'short' })}`;
  }

  #getTotalPrice(points) {
    const offersByType = this.#pointsModel.offers;

    return points.reduce((total, point) => {
      const offerList = offersByType[point.type] || [];
      const selectedOffers = offerList.filter((offer) => point.offers.includes(offer.id));
      const offersTotal = selectedOffers.reduce((sum, offer) => sum + offer.price, 0);

      return total + point.price + offersTotal;
    }, 0);
  }
}
