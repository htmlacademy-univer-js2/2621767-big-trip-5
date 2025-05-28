import FiltersView from '../view/filters-view';
import { UPDATE_TYPE } from '../const';
import { remove, render, replace } from '../framework/render';
import { getAvailableFilters } from '../filters';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #pointsModel = null;
  #filterComponent = null;

  constructor({ filterContainer, filterModel, pointsModel }) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handlePointsModelChange);
    this.#filterModel.addObserver(this.#handlePointsModelChange);
  }

  get filters() {
    return getAvailableFilters(this.#pointsModel.points);
  }

  init() {
    const previousFilterComponent = this.#filterComponent;

    this.#filterComponent = new FiltersView({
      filters: this.filters,
      currentFilter: this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange
    });

    if (!previousFilterComponent) {
      render(this.#filterComponent, this.#filterContainer);
    } else {
      replace(this.#filterComponent, previousFilterComponent);
      remove(previousFilterComponent);
    }
  }

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }
    this.#filterModel.setFilter(UPDATE_TYPE.MAJOR, filterType);
  };

  #handlePointsModelChange = () => {
    this.init();
  };
}
