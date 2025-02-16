import FiltersView from '../view/filters-view.js';
import SortingView from '../view/sorting-view.js';
import FormCreateView from '../view/form-create-view.js';
import PointView from '../view/point-view.js';

export default class TripPresenter {
  constructor(container) {
    this.container = container;
  }

  init() {
    this.renderComponent(new FiltersView());
    this.renderComponent(new SortingView());
    this.renderComponent(new FormCreateView());

    // Отрисуем 3 точки маршрута
    for (let i = 0; i < 3; i++) {
      this.renderComponent(new PointView());
    }
  }

  renderComponent(view) {
    this.container.append(view.getElement());
  }
}
