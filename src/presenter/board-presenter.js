import { render } from '../framework/render';
import Filters from '../view/filters-view';
import PointRouteList from '../view/point-edit-view';
import SortingView from '../view/sorting-view';
import EmptyListView from '../view/empty-list-view';
import EventPresenter from './event-presenter.js';
import { generateFilter } from '../mock/filter-mock';
import { updateItem } from '../utils.js';

export default class BoardPresenter {
  #eventListComponent = new PointRouteList();
  #eventsContainer = null;
  #filterContainer = null;
  #eventsModel = null;
  #boardEvents = [];
  #eventPresenters = new Map();

  #onModeChange = () => {
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
  };

  #onFavoriteBtnClick = (updatedPoint) => {
    this.#boardEvents = updateItem(this.#boardEvents, updatedPoint);
    this.#eventPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  constructor({eventsContainer, filterContainer, eventsModel}) {
    this.#eventsContainer = eventsContainer;
    this.#filterContainer = filterContainer;
    this.#eventsModel = eventsModel;
  }

  init() {
    this.#boardEvents = this.#eventsModel.events;

    const currentFilters = generateFilter(this.#boardEvents);

    if (this.#boardEvents.length > 0) {
      render(new Filters({currentFilters}), this.#filterContainer);
      render(new SortingView(), this.#eventsContainer);
      render(this.#eventListComponent, this.#eventsContainer);

      this.#boardEvents.forEach((point) => this.#renderEvent(point));
    } else {
      render(new EmptyListView(), this.#eventsContainer);
    }
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      eventListContainer: this.#eventListComponent.element,
      onDataChange: this.#onFavoriteBtnClick,
      onViewChange: this.#onModeChange
    });

    eventPresenter.init(event);
    this.#eventPresenters.set(event.id, eventPresenter);
  }
}
