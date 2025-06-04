import { render, replace, remove } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';

const MAX_CITIES_DISPLAYED = 3;


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
    const points = [...this.#pointsModel.points].sort((firstPoint, secondPoint) => new Date(firstPoint.dateFrom) - new Date(secondPoint.dateFrom));

    if (points.length === 0) {
      if (this.#tripInfoComponent) {
        remove(this.#tripInfoComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    const tripRoute = this.#getTripRoute(points);
    const tripDateRange = this.#getTripDateRange(points);
    const tripTotalPrice = this.#getTripTotalPrice(points);

    const previousComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripInfoView({
      route: tripRoute,
      dateRange: tripDateRange,
      totalPrice: tripTotalPrice
    });

    if (!previousComponent) {
      render(this.#tripInfoComponent, this.#container, 'afterbegin');
    } else {
      replace(this.#tripInfoComponent, previousComponent);
    }
  }

  #handleModelChange = () => {
    this.init();
  };

  #getTripRoute(points) {
    const destinations = this.#pointsModel.destinations;

    const cities = points.map((point) => {
      const destination = destinations.find((dest) => dest.id === point.destination);
      return destination ? destination.name : 'Unknown';
    });

    if (cities.length <= MAX_CITIES_DISPLAYED) {
      return cities.join(' — ');
    }

    return `${cities[0]} — ... — ${cities[cities.length - 1]}`;
  }

  #getTripDateRange(points) {
    const startDate = new Date(points[0].dateFrom);
    const endDate = new Date(points[points.length - 1].dateTo);

    const formatMonth = (date) => date.toLocaleString('en', { month: 'short' });
    const formattedStartDate = `${startDate.getDate()} ${formatMonth(startDate)}`;
    const formattedEndDate = `${endDate.getDate()} ${formatMonth(endDate)}`;

    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${formattedStartDate} — ${endDate.getDate()} ${formatMonth(endDate)}`;
    }

    return `${formattedStartDate} — ${formattedEndDate}`;
  }

  #getTripTotalPrice(points) {
    const offersByType = this.#pointsModel.offers;

    return points.reduce((total, point) => {
      const offerList = offersByType[point.type] || [];
      const selectedOffers = offerList.filter((offer) => point.offers.includes(offer.id));
      const offersTotal = selectedOffers.reduce((sum, offer) => sum + offer.price, 0);

      return total + point.price + offersTotal;
    }, 0);
  }
}
