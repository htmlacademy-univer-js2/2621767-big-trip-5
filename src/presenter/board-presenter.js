// src/presenter/board-presenter.js

import {remove, render, RenderPosition, replace} from '../framework/render';
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
      // No need for a separate onActivate, init will handle it
    });

    this.#buttonPointPresenter.init({
      onNewPointButtonClick: this.onNewPointButtonClick,
    });
    this.#buttonPointPresenter.disableButton(); // Отключаем кнопку по умолчанию
  }

  async init() {
    render(this.#eventListComponent, this.#eventsContainer);
    render(this.#loadingView, this.#eventListComponent.element);

    try {
      await this.#pointsListModel.init();
      this.#offers = { ...this.#pointsListModel.offers };
      this.#destinations = [...this.#pointsListModel.destinations];
      this.#buttonPointPresenter.enableButton();
      this.#renderBoard();
    } catch (error) {
      this.#isLoading = false;
      remove(this.#loadingView);
      render(this.#failedLoadingView, this.#eventListComponent.element);
      this.#buttonPointPresenter.disableButton(); // Если загрузка провалилась, кнопка остается отключенной
    } finally {
      this.#isLoading = false;
      remove(this.#loadingView);
      if (this.points.length === 0 && !this.#isCreatingNewPoint) {
        this.#renderNoEvents();
      }

      console.log('Количество элементов в trip-events__list после загрузки данных:', this.#eventListComponent.element.children.length);
    }
  }

  createPoint() {
    if (this.#isLoading || this.#isCreatingNewPoint) {
      return;
    }

    console.log('createPoint called, current events count:', this.points.length);

    this.#isCreatingNewPoint = true;
    this.#buttonPointPresenter.disableButton();

    // Закрываем все другие формы редактирования
    this.#onModeChange('create');

    // Если есть пустой список, удаляем его
    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
    }

    // НЕ ОЧИЩАЕМ список событий! Просто добавляем форму в начало
    this.#newEventPresenter.init(
      this.#pointsListModel.destinations,
      this.#pointsListModel.offers
    );

    console.log('New event form initialized');
  }

  #renderBoard() {
    this.#renderSort();
    this.#renderEventsList();
  }

  // Simplified onModeChange to handle closing existing forms
  #onModeChange = (initiatorType, initiatorId = null) => {
    // Close form creation if it's open AND the initiator isn't 'create'
    if (this.#isCreatingNewPoint && initiatorType !== 'create') {
      this.#newEventPresenter.destroy({ isCanceled: true });
    }

    // Close all edit forms except the one that initiated the change (if type is 'edit')
    this.#eventPresenters.forEach((presenter) => {
      if (presenter.event && (presenter.event.id !== initiatorId || initiatorType === 'create')) {
        presenter.resetView();
      }
    });
  };

  #actions = {
    [ACTIONS.UPDATE_POINT]: async (type, data) => {
      console.log('ACTION: UPDATE_POINT', type, data);
      try {
        this.#uiBlocker.block();
        await this.#pointsListModel.updatePoint(type, data);
      } catch (error) {
        console.error('Error updating point:', error);
        this.#eventPresenters.get(data.id)?.setAborting();
      } finally {
        this.#uiBlocker.unblock();
      }
    },

    [ACTIONS.ADD_POINT]: async (type, data) => {
      console.log('ACTION: ADD_POINT', type, data);
      try {
        this.#uiBlocker.block();

        // Добавляем событие в модель
        await this.#pointsListModel.addPoint(type, data);

        console.log('Point added to model successfully');

        // НЕ вызываем onDestroy здесь - это должен делать NewEventPresenter

      } catch (error) {
        console.error('Error adding point:', error);
        this.#newEventPresenter.setAborting();
        throw error; // Пробрасываем ошибку для обработки в NewEventPresenter
      } finally {
        this.#uiBlocker.unblock();
      }
    },

    [ACTIONS.DELETE_POINT]: async (type, data) => {
      console.log('ACTION: DELETE_POINT', type, data);
      try {
        this.#uiBlocker.block();
        await this.#pointsListModel.deletePoint(type, data);
      } catch (error) {
        console.error('Error deleting point:', error);
        this.#eventPresenters.get(data.id)?.setAborting();
      } finally {
        this.#uiBlocker.unblock();
      }
    },
  };

  #changePointsList = (actionType, updateType, update) => {
    this.#actions[actionType]?.(updateType, update);
  };

  #updateEventList = (updateType, data) => {
    console.log('updateEventList called:', updateType, data);

    switch (updateType) {
      case UPDATE_TYPE.PATCH:
        // Обновляем только конкретное событие
        this.#eventPresenters.get(data.id)?.init(data);
        break;

      case UPDATE_TYPE.MINOR:
        // При добавлении/удалении события - полностью перерисовываем список
        console.log('MINOR update - re-rendering events list');
        this.#clearEventsList();
        this.#renderEventsList();
        break;

      case UPDATE_TYPE.MAJOR:
        // При изменении фильтра - полностью перерисовываем доску
        console.log('MAJOR update - re-rendering board');
        this.#clearEventsList(true);
        this.#renderBoard();
        break;

      case UPDATE_TYPE.INIT:
        this.#isLoading = false;
        remove(this.#loadingView);
        this.#renderBoard();
        this.#buttonPointPresenter.enableButton();
        break;
    }
  }


  // Removed #onNewPointFormActivate as its logic is now handled in createPoint and NewEventPresenter.init directly.

  onNewPointButtonClick = () => {
    // This function is called by ButtonPointPresenter.
    this.createPoint();
    // Reset the filter to "Everything" when creating a new point
    this.#filterModel.setFilter(UPDATE_TYPE.MAJOR, FILTER_TYPE.EVERYTHING);
  };

  #onNewPointDestroy = ({ isCanceled = true, newPoint } = {}) => {
    console.log('onNewPointDestroy called:', { isCanceled, hasNewPoint: !!newPoint });

    this.#isCreatingNewPoint = false;
    this.#buttonPointPresenter.enableButton();

    // Если событие было отменено И нет других событий - показываем пустой список
    if (isCanceled && this.points.length === 0) {
      this.#renderNoEvents();
    }
    // Если событие создано успешно - ничего не делаем
    // Модель уже уведомит об изменении через observer

    console.log('onNewPointDestroy completed');
  }


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
    console.log('renderEventsList called');

    const filteredPoints = this.points;
    console.log('Filtered points count:', filteredPoints.length);

    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
    }

    // Если нет событий И не создается новое событие И не идет загрузка
    if (!filteredPoints.length && !this.#isCreatingNewPoint && !this.#isLoading) {
      this.#renderNoEvents();
      return;
    }

    const sorter = {
      [SORT_TYPE.PRICE]: sortByPrice,
      [SORT_TYPE.TIME]: sortByTime,
      [SORT_TYPE.DAY]: sortByDay
    }[this.#currentSortType] || sortByDay;

    // Сортируем только если есть события
    const sortedPoints = filteredPoints.length > 0 ? filteredPoints.slice().sort(sorter) : [];

    console.log('Rendering', sortedPoints.length, 'events');

    sortedPoints.forEach((event) => {
      this.#renderEvent(event);
    });

    console.log('Events rendered, presenters count:', this.#eventPresenters.size);
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
    if (!this.#emptyPointListComponent) {
      this.#emptyPointListComponent = new EmptyListView({ filterType: this.#filterType });
      render(this.#emptyPointListComponent, this.#eventListComponent.element, RenderPosition.AFTERBEGIN);
    }
  }

  #clearEventsList(resetSortType = false) {
    console.log('clearEventsList called, resetSortType:', resetSortType);
    console.log('Current presenters count:', this.#eventPresenters.size);

    // Уничтожаем все презентеры событий
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();

    // ВАЖНО: НЕ уничтожаем NewEventPresenter если мы в процессе создания
    // Он должен уничтожаться только через свой собственный destroy

    // Удаляем компонент пустого списка
    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
    }

    if (resetSortType && this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
      this.#currentSortType = SORT_TYPE.DAY;
    }

    console.log('clearEventsList completed');
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsListModel.points;
    return filter[this.#filterType](points);
  }
}
