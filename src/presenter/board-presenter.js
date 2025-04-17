import { render, remove, RenderPosition } from '../framework/render';
import Filters from '../view/filters-view';
import PointRouteList from '../view/point-edit-view';
import SortingView from '../view/sorting-view';
import EmptyListView from '../view/empty-list-view';
import EventPresenter from './event-presenter';
import { SORT_TYPES } from '../const';
import { sortByDay, sortByTime, sortByPrice, updateItem } from '../utils';
import { generateFilter } from '../mock/filter-mock';

export default class BoardPresenter {
  #eventListComponent = new PointRouteList();
  #eventsContainer = null;
  #filterContainer = null;
  #pointsListModel = null;
  #emptyPointListComponent = null;
  #destinations = null;
  #offers = null;
  #boardEvents = [];
  #filters = [];
  #eventPresenters = new Map();
  #sortComponent = null;
  #currentSortType = SORT_TYPES.DAY;

  constructor({ eventsContainer, filterContainer, pointsListModel }) {
    this.#eventsContainer = eventsContainer;
    this.#filterContainer = filterContainer;
    this.#pointsListModel = pointsListModel;
  }

  // board-presenter.js
  init() {
    // Add proper null checks
    this.#boardEvents = Array.isArray(this.#pointsListModel?.points)
      ? [...this.#pointsListModel.points]
      : [];

    this.#offers = Array.isArray(this.#pointsListModel?.offers)
      ? [...this.#pointsListModel.offers]
      : [];

    this.#destinations = Array.isArray(this.#pointsListModel?.destinations)
      ? [...this.#pointsListModel.destinations]
      : [];

    this.#filters = generateFilter(this.#boardEvents);
    this.#renderFilters();
    this.#renderSort();
    this.#renderEventsList();
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      destinations: this.#destinations, // Use the stored destinations
      offers: this.#offers,
      eventListContainer: this.#eventListComponent,
      onDataChange: this.#onFavoriteBtnClick,
      onViewChange: this.#onModeChange
    });
    eventPresenter.init(event);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  #onModeChange = () => {
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
  };

  #onFavoriteBtnClick = (updatedEvent) => {
    this.#boardEvents = updateItem(this.#boardEvents, updatedEvent);
    this.#eventPresenters.get(updatedEvent.id).init(updatedEvent);
  };

  #clearEventsList() {
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();
    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
    }
  }

  #onSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortEvents(sortType);
    this.#renderSort();
    this.#clearEventsList();
    this.#renderEventsList();
  };

  #sortEvents(sortType) {
    switch (sortType) {
      case SORT_TYPES.PRICE:
        this.#boardEvents.sort(sortByPrice);
        break;
      case SORT_TYPES.TIME:
        this.#boardEvents.sort(sortByTime);
        break;
      default:
        this.#boardEvents.sort(sortByDay);
    }

    this.#currentSortType = sortType;
  }

  #renderSort() {
    if (this.#sortComponent !== null) {
      remove(this.#sortComponent);
    }

    this.#sortComponent = new SortingView({
      onSortTypeChange: this.#onSortTypeChange,
      currentSortType: this.#currentSortType
    });

    render(this.#sortComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
  }

  #renderEventsList() {
    render(this.#eventListComponent, this.#eventsContainer);

    if (this.#boardEvents.length) {
      this.#sortEvents(this.#currentSortType);
      this.#boardEvents.forEach((event) => this.#renderEvent(event));
    } else {
      this.#renderNoEvents();
    }
  }

  #renderNoEvents() {
    this.#emptyPointListComponent = new EmptyListView();
    render(this.#emptyPointListComponent, this.#eventListComponent.element);
  }

  #renderFilters() {
    render(new Filters({ filters: this.#filters }), this.#filterContainer);
  }
}
