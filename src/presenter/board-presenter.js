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
  #eventsModel = null;
  #boardEvents = [];
  #filters = [];
  #eventPresenters = new Map();
  #sortComponent = null;
  #currentSortType = SORT_TYPES.DAY;

  constructor({ eventsContainer, filterContainer, eventsModel }) {
    this.#eventsContainer = eventsContainer;
    this.#filterContainer = filterContainer;
    this.#eventsModel = eventsModel;
  }

  init() {
    this.#boardEvents = [...this.#eventsModel.events];
    this.#filters = generateFilter(this.#boardEvents);

    this.#renderFilters();
    this.#renderSort();
    this.#renderEventsList();
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
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
    render(new EmptyListView(), this.#eventListComponent.element);
  }

  #renderFilters() {
    render(new Filters({ filters: this.#filters }), this.#filterContainer);
  }
}
