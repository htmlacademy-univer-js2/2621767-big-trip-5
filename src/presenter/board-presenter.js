import { remove, render, RenderPosition, replace } from '../framework/render';
import SortingView from '../view/sorting-view';
import LoadingView from '../view/loading-view';
import FailedLoadingView from '../view/failed-loading-view';
import EmptyListView from '../view/empty-list-view';
import EventPresenter from './event-presenter';
import NewEventPresenter from './new-event-presenter';
import { ACTION_TYPE, FILTER_TYPE, SORT_TYPE, UPDATE_TYPE } from '../const';
import { filterPoints, sortByDay, sortByPrice, sortByTime } from '../utils';
import EventsListView from '../view/event-list-view';
import UiBlocker from '../framework/ui-blocker/ui-blocker';

export default class BoardPresenter {
  #eventListComponent = new EventsListView();
  #eventsContainer = null;
  #filterModel = null;
  #pointsModel = null;
  #emptyPointListComponent = null;
  #destinations = [];
  #offers = {};
  #eventPresenters = new Map();
  #sortComponent = null;
  #newEventPresenter = null;
  #currentSortType = SORT_TYPE.DAY;
  #filterType = FILTER_TYPE.EVERYTHING;
  #buttonPointPresenter = null;
  #isCreatingNewPoint = false;
  #loadingView = new LoadingView();
  #failedLoadingView = new FailedLoadingView();
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: 300,
    upperLimit: 1000,
  });

  constructor({ eventsContainer, filterModel, pointsModel, buttonPointPresenter }) {
    this.#eventsContainer = eventsContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;
    this.#buttonPointPresenter = buttonPointPresenter;

    this.#filterModel.addObserver(this.#handleEventListUpdate);
    this.#pointsModel.addObserver(this.#handleEventListUpdate);

    this.#newEventPresenter = new NewEventPresenter({
      listComponent: this.#eventListComponent.element,
      onDataChange: this.#handleChangePointsList,
      onDestroy: this.#handleNewPointDestroy,
    });

    this.#buttonPointPresenter.init({
      onNewPointButtonClick: this.handleNewPointButtonClick,
    });
    this.#buttonPointPresenter.disableButton();
  }

  async init() {
    render(this.#eventListComponent, this.#eventsContainer);
    render(this.#loadingView, this.#eventListComponent.element);

    try {
      await this.#pointsModel.init();
      this.#offers = { ...this.#pointsModel.offers };
      this.#destinations = [...this.#pointsModel.destinations];
      this.#buttonPointPresenter.enableButton();
      this.#renderBoard();
    } catch (error) {
      this.#isLoading = false;
      remove(this.#loadingView);
      render(this.#failedLoadingView, this.#eventListComponent.element);
      this.#buttonPointPresenter.disableButton();
    } finally {
      this.#isLoading = false;
      remove(this.#loadingView);
      if (this.points.length === 0) {
        this.#renderNoEvents();
      }
    }
  }

  createPoint() {
    if (this.#isLoading || this.#isCreatingNewPoint) {
      return;
    }

    this.#isCreatingNewPoint = true;
    this.#buttonPointPresenter.disableButton();

    this.#handleModeChange('create');

    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
    }

    this.#newEventPresenter.init(
      this.#pointsModel.destinations,
      this.#pointsModel.offers
    );
  }

  #renderBoard() {
    this.#renderSort();
    this.#renderEventsList();
  }

  #handleModeChange = (initiatorType, initiatorId = null) => {
    if (this.#isCreatingNewPoint && initiatorType !== 'create') {
      this.#newEventPresenter.destroy({ isCanceled: true });
    }

    this.#eventPresenters.forEach((presenter) => {
      if (presenter.event && (presenter.event.id !== initiatorId || initiatorType === 'create')) {
        presenter.resetView();
      }
    });
  };

  #actions = {
    [ACTION_TYPE.UPDATE_POINT]: async (type, data) => {
      try {
        this.#uiBlocker.block();
        await this.#pointsModel.updatePoint(type, data);
      } catch (error) {
        this.#eventPresenters.get(data.id)?.setAborting();
      } finally {
        this.#uiBlocker.unblock();
      }
    },

    [ACTION_TYPE.ADD_POINT]: async (type, data) => {
      try {
        this.#uiBlocker.block();
        await this.#pointsModel.addPoint(type, data);
        this.#newEventPresenter.destroy({ isCanceled: false, newPoint: data });
      } catch (error) {
        this.#newEventPresenter.setAborting();
      } finally {
        this.#uiBlocker.unblock();
      }
    },

    [ACTION_TYPE.DELETE_POINT]: async (type, data) => {
      try {
        this.#uiBlocker.block();
        await this.#pointsModel.deletePoint(type, data);
      } catch (error) {
        this.#eventPresenters.get(data.id)?.setAborting();
      } finally {
        this.#uiBlocker.unblock();
      }
    },
  };

  #handleChangePointsList = (actionType, updateType, update) => {
    this.#actions[actionType]?.(updateType, update);
  };

  #handleEventListUpdate = (updateType, data) => {
    switch (updateType) {
      case UPDATE_TYPE.PATCH:
        this.#eventPresenters.get(data.id)?.init(data);
        break;

      case UPDATE_TYPE.MINOR:
        this.#clearEventsList();
        this.#renderEventsList();
        break;

      case UPDATE_TYPE.MAJOR:
        this.#clearEventsList(true);
        this.#renderBoard();
        break;

      case UPDATE_TYPE.INIT:
        this.#isLoading = false;
        remove(this.#loadingView);
        this.#buttonPointPresenter.enableButton();
        break;
    }
  };

  handleNewPointButtonClick = () => {
    this.createPoint();
    this.#filterModel.setFilter(UPDATE_TYPE.MAJOR, FILTER_TYPE.EVERYTHING);
  };

  #handleNewPointDestroy = ({ isCanceled = true, newPoint } = {}) => {
    this.#isCreatingNewPoint = false;
    this.#buttonPointPresenter.enableButton();

    if ((isCanceled && this.points.length === 0) || (newPoint && this.points.length === 1 && this.#filterModel.filter === FILTER_TYPE.EVERYTHING)) {
      this.#renderNoEvents();
    } else if (this.points.length > 0 && this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
      if (!this.#eventListComponent.element.parentNode) {
        render(this.#eventListComponent, this.#eventsContainer);
      }
    }
  };


  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearEventsList();
    this.#renderSort();
    this.#renderEventsList();
  };

  #renderSort() {
    if (this.points.length === 0 && !this.#isCreatingNewPoint && !this.#isLoading && !this.#failedLoadingView.element) {
      if (this.#sortComponent) {
        remove(this.#sortComponent);
        this.#sortComponent = null;
      }
      return;
    }

    const prevSortComponent = this.#sortComponent;

    this.#sortComponent = new SortingView({
      onSortTypeChange: this.#handleSortTypeChange,
      currentSortType: this.#currentSortType,
    });

    if (prevSortComponent === null) {
      render(this.#sortComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
    } else {
      replace(this.#sortComponent, prevSortComponent);
      remove(prevSortComponent);
    }
  }


  #renderEventsList() {
    const filteredPoints = this.points;

    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
    }

    if (filteredPoints.length === 0 && !this.#isCreatingNewPoint) {
      this.#renderNoEvents();
      return;
    }

    const sorter = {
      [SORT_TYPE.PRICE]: sortByPrice,
      [SORT_TYPE.TIME]: sortByTime,
      [SORT_TYPE.DAY]: sortByDay
    }[this.#currentSortType] || sortByDay;

    const sortedPoints = filteredPoints.length > 0 ? filteredPoints.slice().sort(sorter) : [];

    sortedPoints.forEach((event) => {
      this.#renderEvent(event);
    });
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      destinations: this.#destinations,
      offers: this.#offers,
      eventListContainer: this.#eventListComponent,
      onDataChange: this.#handleChangePointsList,
      onViewChange: this.#handleModeChange,
    });
    eventPresenter.init(event);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  #renderNoEvents() {
    if (!this.#emptyPointListComponent) {
      this.#emptyPointListComponent = new EmptyListView({ filterType: this.#filterType });
      render(this.#emptyPointListComponent, this.#eventListComponent.element, RenderPosition.AFTERBEGIN);
    }
  }

  #clearEventsList(resetSortType = false) {
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();

    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
    }

    if (resetSortType) {
      if (this.#sortComponent) {
        remove(this.#sortComponent);
        this.#sortComponent = null;
      }
      this.#currentSortType = SORT_TYPE.DAY;
    }
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    return filterPoints[this.#filterType](points);
  }
}
