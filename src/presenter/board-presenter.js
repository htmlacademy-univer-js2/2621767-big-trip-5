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
      pointsListModel: this.#pointsListModel, // Это может быть лишним, если модель передается в init PointListModel
      onDataChange: this.#changePointsList,
      onDestroy: this.#onNewPointDestroy,
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
      this.#buttonPointPresenter.disableButton();
    } finally {
      this.#isLoading = false;
      remove(this.#loadingView); // Всегда удаляем загрузчик, даже при ошибке
      if (this.points.length === 0) {
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
        await this.#pointsListModel.addPoint(type, data);
        console.log('Point added to model successfully');
        // --- Ключевое изменение: вызываем destroy() ТОЛЬКО здесь, после успешного добавления ---
        this.#newEventPresenter.destroy({ isCanceled: false, newPoint: data });
      } catch (error) {
        console.error('Error adding point:', error);
        this.#newEventPresenter.setAborting();
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
        // Если инициализация прошла успешно, и нет ошибок загрузки,
        // то this.#renderBoard() уже вызывается в init()
        // this.#renderBoard(); // Этот вызов здесь лишний, так как уже есть в init().
        this.#buttonPointPresenter.enableButton();
        break;
    }
  }

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
    // Также, если есть EmptyListView из-за отсутствия точек, нужно его показать
    // Или если это не отмена, а успешное добавление, и нет других точек, то тоже нужно перерисовать пустой список
    if ((isCanceled && this.points.length === 0) || (newPoint && this.points.length === 1 && this.#filterModel.filter === FILTER_TYPE.EVERYTHING)) {
      this.#renderNoEvents();
    } else if (this.points.length > 0 && this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
      // Возможно, здесь нужно рендерить eventListComponent, если он был удален
      if (!this.#eventListComponent.element.parentNode) {
        render(this.#eventListComponent, this.#eventsContainer);
      }
    }


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
    // Если список точек пуст, или если загрузка не завершена, или если ошибка загрузки, не рендерим сортировку
    if (this.points.length === 0 && !this.#isCreatingNewPoint && !this.#isLoading && !this.#failedLoadingView.element) {
      if (this.#sortComponent) {
        remove(this.#sortComponent);
        this.#sortComponent = null;
      }
      return;
    }

    const prevSortComponent = this.#sortComponent;

    this.#sortComponent = new SortingView({
      onSortTypeChange: this.#onSortTypeChange,
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
    console.log('renderEventsList called');

    const filteredPoints = this.points;
    console.log('Filtered points count:', filteredPoints.length);

    if (this.#emptyPointListComponent) {
      remove(this.#emptyPointListComponent);
      this.#emptyPointListComponent = null;
    }

    // Если нет событий И не создается новое событие И не идет загрузка И НЕ ошибка загрузки
    if (filteredPoints.length === 0 && !this.#isCreatingNewPoint) {
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

    // НЕ уничтожаем NewEventPresenter если мы в процессе создания
    // Он должен уничтожаться только через свой собственный destroy

    // Удаляем компонент пустого списка
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

    console.log('clearEventsList completed');
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsListModel.points;
    return filter[this.#filterType](points);
  }
}
