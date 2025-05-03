import { render, remove, RenderPosition } from '../framework/render';
import PointRouteList from '../view/point-edit-view';
import SortingView from '../view/sorting-view';
import EmptyListView from '../view/empty-list-view';
import EventPresenter from './event-presenter';
import NewEventPresenter from './new-event-presenter';
import { SORT_TYPE, ACTIONS, UPDATE_TYPE, FILTER_TYPE } from '../const';
import { sortByDay, sortByTime, sortByPrice, filter } from '../utils';
import { generateFilter } from '../mock/filter-mock';

export default class BoardPresenter {
  #eventListComponent = new PointRouteList();
  #eventsContainer = null;
  #filterModel = null;
  #pointsListModel = null;
  #emptyPointListComponent = null;
  #destinations = null;
  #offers = null;
  #boardEvents = [];
  #filters = [];
  #eventPresenters = new Map();
  #sortComponent = null;
  #newEventPresenter = null;
  #currentSortType = SORT_TYPE.DAY;
  #filterType = FILTER_TYPE.EVERYTHING;
  #buttonPointPresenter = null;
  #isCreatingNewPoint = false;

  constructor({ eventsContainer, filterModel, pointsListModel, buttonPointPresenter }) {
    this.#eventsContainer = eventsContainer;
    this.#filterModel = filterModel;
    this.#pointsListModel = pointsListModel;
    this.#buttonPointPresenter = buttonPointPresenter;

    this.#filterModel.addObserver(this.#updateEventList);
    this.#pointsListModel.addObserver(this.#updateEventList);

    this.#newEventPresenter = new NewEventPresenter({
      listComponent: this.#eventListComponent.element,
      pointsListModel: this.#pointsListModel,
      onDataChange: this.#changePointsList,
      onDestroy: this.#onNewPointDestroy
    });
  }

  init() {
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
    this.#renderSort();
    this.#renderEventsList();
  }

  createPoint() {
    this.#newEventPresenter.init();
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      destinations: this.#destinations,
      offers: this.#offers,
      eventListContainer: this.#eventListComponent,
      onDataChange: this.#changePointsList,
      onViewChange: this.#onModeChange
    });
    eventPresenter.init(event);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  #onModeChange = () => {
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
    this.#newEventPresenter.destroy();
  };

  #actions = {
    [ACTIONS.UPDATE_POINT]: (type, data) => this.#pointsListModel.updatePoint(type, data),
    [ACTIONS.ADD_POINT]: (type, data) => this.#pointsListModel.addPoint(type, data),
    [ACTIONS.DELETE_POINT]: (type, data) => this.#pointsListModel.deletePoint(type, data)
  };

  #changePointsList = (actionType, updateType, update) => {
    this.#actions[actionType]?.(updateType, update);
  };

  #updateEventList = (updateType, data) => {
    this.#boardEvents = [...this.#pointsListModel.points];
    const updateStrategies = {
      [UPDATE_TYPE.PATCH]: () => this.#eventPresenters.get(data.id)?.init(data),
      [UPDATE_TYPE.MINOR]: () => {
        this.#clearEventsList();
        this.#renderEventsList();
      },
      [UPDATE_TYPE.MAJOR]: () => {
        this.#clearEventsList(true);
        this.#renderEventsList();
      }
    };
    updateStrategies[updateType]?.();
  };

  onNewPointButtonClick = () => {
    this.#isCreatingNewPoint = true;
    this.#filterModel.setFilter(UPDATE_TYPE.MAJOR, FILTER_TYPE.EVERYTHING);
    this.#buttonPointPresenter.disableButton();
    this.#newEventPresenter.init();
  };

  #onNewPointDestroy = ({ isCanceled }) => {
    this.#isCreatingNewPoint = false;
    this.#buttonPointPresenter.enableButton();
    if (this.points.length === 0 && isCanceled) {
      this.#clearEventsList();
      this.#renderEventsList();
    }
  };

  #onSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearEventsList();
    this.#renderSort();
    this.#renderEventsList();
  };

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
    const filteredPoints = this.points;
    if (filteredPoints.length) {
      const sorters = {
        [SORT_TYPE.PRICE]: sortByPrice,
        [SORT_TYPE.TIME]: sortByTime,
        [SORT_TYPE.DAY]: sortByDay
      };
      const sorter = sorters[this.#currentSortType] || sortByDay;
      const sortedPoints = [...filteredPoints].sort(sorter);
      sortedPoints.forEach((event) => this.#renderEvent(event));
    } else {
      this.#renderNoEvents();
    }
  }

  #renderNoEvents() {
    this.#emptyPointListComponent = new EmptyListView({ filterType: this.#filterType });
    render(this.#emptyPointListComponent, this.#eventListComponent.element, RenderPosition.AFTERBEGIN);
  }

  #clearEventsList(resetSortType = false) {
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();
    this.#newEventPresenter.destroy();

    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SORT_TYPE.DAY;
      this.#renderSort();
    }
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    return filter[this.#filterType](this.#pointsListModel.points);
  }
}
