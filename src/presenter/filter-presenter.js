import FiltersView from '../view/filters-view';
import { FILTER_TYPE, UPDATE_TYPE } from '../const';
import {remove, render, replace} from '../framework/render';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #pointsListModel = null;
  #filterComponent = null;

  #onFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }
    this.#filterModel.setFilter(UPDATE_TYPE.MAJOR, filterType);
  };

  #onPointsModelChange = () => {
    this.init();
  };

  constructor({filterContainer, filterModel, pointsListModel}) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#pointsListModel = pointsListModel;

    this.#pointsListModel.addObserver(this.#onPointsModelChange);
    this.#filterModel.addObserver(this.#onPointsModelChange);
  }

  get filters() {
    return Object.values(FILTER_TYPE).map((type) => ({
      id: type,
      name: type,
    }));
  }

  init() {
    const previousFilterComponent = this.#filterComponent;

    this.#filterComponent = new FiltersView({
      filters: this.filters,
      currentFilter: this.#filterModel.filter,
      onFilterTypeChange: this.#onFilterTypeChange
    });

    if (!previousFilterComponent) {
      render(this.#filterComponent, this.#filterContainer);
    } else {
      replace(this.#filterComponent, previousFilterComponent);
      remove(previousFilterComponent);
    }
  }
}
