import {remove, render, RenderPosition} from '../framework/render';
import SortingView from '../view/sorting-view';
import LoadingView from '../view/loading-view';
import FailedLoadingView from '../view/failed-loading-view';
import EmptyListView from '../view/empty-list-view';
import EventPresenter from './event-presenter';
import NewEventPresenter from './new-event-presenter';
import {ACTIONS, FILTER_TYPE, SORT_TYPE, UPDATE_TYPE} from '../const';
import {filter, sortByDay, sortByPrice, sortByTime} from '../utils';
import EventsListView from '../view/event-list-view';
import UiBlocker from '../framework/ui-blocker/ui-blocker';

export default class BoardPresenter {
  #eventListComponent = new EventsListView();
  #eventsContainer = null;
  #filterModel = null;
  #pointsListModel = null;
  #emptyPointListComponent = null;
  #destinations = [];
  #offers = {};
  #boardEvents = [];
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
    lowerLimit: 350,
    upperLimit: 1500,
  });

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
      onDestroy: this.#onNewPointDestroy,
    });
  }

  async init() {
    render(this.#eventListComponent, this.#eventsContainer);
    render(this.#loadingView, this.#eventListComponent.element);

    try {
      await this.#pointsListModel.init();
      this.#boardEvents = [...this.#pointsListModel.points];
      this.#offers = { ...this.#pointsListModel.offers };
      this.#destinations = [...this.#pointsListModel.destinations];
      this.#renderBoard();
    } catch (error) {
      this.#isLoading = false;
      remove(this.#loadingView);
      render(this.#failedLoadingView, this.#eventListComponent.element);
    } finally {
      this.#isLoading = false;
      remove(this.#loadingView);
      if (this.#boardEvents.length === 0 && !this.#isLoading) {
        this.#renderNoEvents();
      }
    }
  }

  createPoint() {
    this.#newEventPresenter.init(this.#destinations, this.#offers);
  }

  #renderBoard() {
    this.#renderSort();
    this.#renderEventsList();
  }

  #onModeChange = () => {
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
    this.#newEventPresenter.destroy();
  };

  #actions = {
    [ACTIONS.UPDATE_POINT]: async (type, data) => {
      try {
        this.#uiBlocker.block();
        await this.#pointsListModel.updatePoint(type, data);
      } catch (error) {
        this.#eventPresenters.get(data.id)?.setAborting();
        throw error;
      } finally {
        this.#uiBlocker.unblock();
      }
    },
    [ACTIONS.ADD_POINT]: async (type, data) => {
      try {
        this.#uiBlocker.block();
        await this.#pointsListModel.addPoint(type, data);
        this.#isCreatingNewPoint = false;
        this.#buttonPointPresenter.enableButton();
      } catch (error) {
        this.#newEventPresenter.setAborting();
      } finally {
        this.#uiBlocker.unblock();
      }
    },
    [ACTIONS.DELETE_POINT]: async (type, data) => {
      try {
        this.#uiBlocker.block();
        await this.#pointsListModel.deletePoint(type, data);
      } catch (error) {
        this.#eventPresenters.get(data.id)?.setAborting();
        throw error;
      } finally {
        this.#uiBlocker.unblock();
      }
    },
  };

  #changePointsList = (actionType, updateType, update) => {
    this.#actions[actionType]?.(updateType, update);
  };

  #updateEventList = (updateType, data) => {
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
        this.#renderBoard();
        break;
    }
  };

  onNewPointButtonClick = () => {
    this.#isCreatingNewPoint = true;
    this.#filterModel.setFilter(UPDATE_TYPE.MAJOR, FILTER_TYPE.EVERYTHING);
    this.#buttonPointPresenter.disableButton();
    this.#newEventPresenter.init(this.#destinations, this.#offers);
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
      currentSortType: this.#currentSortType,
    });

    render(this.#sortComponent, this.#eventsContainer, RenderPosition.AFTERBEGIN);
  }

  #renderEventsList() {
    if (this.#isLoading) {
      return;
    }

    const filteredPoints = this.points;

    if (!filteredPoints.length) {
      this.#renderNoEvents();
      return;
    }

    const sorter = {
      [SORT_TYPE.PRICE]: sortByPrice,
      [SORT_TYPE.TIME]: sortByTime,
      [SORT_TYPE.DAY]: sortByDay
    }[this.#currentSortType] || sortByDay;

    filteredPoints.slice().sort(sorter).forEach((event) => {
      this.#renderEvent(event);
    });
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      destinations: this.#destinations,
      offers: this.#offers,
      eventListContainer: this.#eventListComponent,
      onDataChange: this.#changePointsList,
      onViewChange: this.#onModeChange,
    });
    eventPresenter.init(event);
    this.#eventPresenters.set(event.id, eventPresenter);
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

    if (resetSortType && this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
      this.#currentSortType = SORT_TYPE.DAY;
    }
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    return filter[this.#filterType](this.#pointsListModel.points);
  }

  #clearPoint = (id) => {
    this.#eventPresenters.get(id)?.destroy();
    this.#eventPresenters.delete(id);
  };
}
