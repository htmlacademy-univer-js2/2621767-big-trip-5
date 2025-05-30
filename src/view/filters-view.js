import AbstractView from '../framework/view/abstract-view.js';

function createFilterItemTemplate(filter, currentFilterType) {
  return `<div class="trip-filters__filter">
    <input id="filter-${filter.id}"
           class="trip-filters__filter-input visually-hidden"
           type="radio"
           name="trip-filter"
           value="${filter.id}"
           ${currentFilterType === filter.id ? 'checked' : ''}
           ${filter.isDisabled ? 'disabled' : ''}>
    <label class="trip-filters__filter-label" for="filter-${filter.id}">
      ${filter.name}
    </label>
  </div>`;
}

function createFiltersTemplate(filters, currentFilterType) {
  return `
    <form class="trip-filters" action="#" method="get">
      ${filters.map((filter) => createFilterItemTemplate(filter, currentFilterType)).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FiltersView extends AbstractView {
  #filters = null;
  #currentFilterType = null;
  #onFilterTypeChange = null;

  constructor({ filters, currentFilter, onFilterTypeChange }) {
    super();
    this.#filters = filters;
    this.#currentFilterType = currentFilter;
    this.#onFilterTypeChange = onFilterTypeChange;

    this.#setEventListeners();
  }

  get template() {
    return createFiltersTemplate(this.#filters, this.#currentFilterType);
  }

  #setEventListeners() {
    this.element.querySelectorAll('.trip-filters__filter-input').forEach((filterInputElement) => {
      filterInputElement.addEventListener('change', this.#handleFilterTypeChange);
    });
  }

  #handleFilterTypeChange = (event) => {
    this.#onFilterTypeChange(event.target.value);
  };
}
