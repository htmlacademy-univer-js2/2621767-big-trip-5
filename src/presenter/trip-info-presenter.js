import { render, replace, remove } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';

export default class TripInfoPresenter {
  #container = null;
  #pointsModel = null;
  #tripInfoComponent = null; // Keep track of the rendered component

  constructor({ container, pointsModel }) {
    this.#container = container;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelChange);
  }

  init() {
    const points = [...this.#pointsModel.points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

    // If there are no points, remove the existing component if it's rendered
    if (points.length === 0) {
      if (this.#tripInfoComponent) { // Check if the component is currently rendered
        remove(this.#tripInfoComponent); // Remove it from the DOM
        this.#tripInfoComponent = null; // Clear the reference
      }
      return; // Stop further rendering
    }

    // If there are points, proceed to render/replace
    const route = this.#getRoute(points);
    const dateRange = this.#getDateRange(points);
    const totalPrice = this.#getTotalPrice(points);

    const prevComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripInfoView({ route, dateRange, totalPrice });

    if (!prevComponent) {
      render(this.#tripInfoComponent, this.#container, 'afterbegin');
    } else {
      replace(this.#tripInfoComponent, prevComponent);
      // No need to remove(prevComponent) here, as replace already handles it
      // if your framework's replace correctly removes the old element.
      // If not, you might need to keep it, but usually 'replace' implies removal.
      // Assuming 'replace' correctly replaces the old element:
      // remove(prevComponent); // This line is often redundant if replace works as expected.
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

    // Ensure this correctly handles the "..." case for more than 3 cities
    return `${cities[0]} — ... — ${cities[cities.length - 1]}`;
  }

  #getDateRange(points) {
    const start = new Date(points[0].dateFrom);
    const end = new Date(points[points.length - 1].dateTo);

    // Format dates to 'DD MMM'
    const formatMonth = (date) => date.toLocaleString('en', { month: 'short' });
    const startDate = `${start.getDate()} ${formatMonth(start)}`;
    const endDate = `${end.getDate()} ${formatMonth(end)}`;

    // Handle single-day trips where start and end date might be the same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startDate} — ${end.getDate()} ${formatMonth(end)}`;
    }

    return `${startDate} — ${endDate}`;
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
