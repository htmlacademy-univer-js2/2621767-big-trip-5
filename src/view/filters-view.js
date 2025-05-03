import AbstractView from '../framework/view/abstract-view.js';

function createFilterTemplate(filter, currentFilter) {
  return `<div class="trip-filters__filter">
    <input id="filter-${filter.id}"
           class="trip-filters__filter-input visually-hidden"
           type="radio"
           name="trip-filter"
           value="${filter.id}"
           ${currentFilter === filter.id ? 'checked' : ''}>
    <label class="trip-filters__filter-label" for="filter-${filter.id}">
      ${filter.name}
    </label>
  </div>`;
}

function createFiltersTemplate(filters, currentFilter) {
  return `
    <form class="trip-filters" action="#" method="get">
      ${filters.map((filter) => createFilterTemplate(filter, currentFilter)).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FiltersView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #handleFilterTypeChange = null;

  constructor({filters, currentFilter, onFilterTypeChange}) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this.#handleFilterTypeChange = onFilterTypeChange;

    this.#setupEventListeners();
  }

  get template() {
    return createFiltersTemplate(this.#filters, this.#currentFilter);
  }

  #setupEventListeners() {
    this.element.querySelectorAll('.trip-filters__filter-input').forEach((filterInputElement) => {
      filterInputElement.addEventListener('change', this.#filterTypeChangeHandler);
    });
  }

  #filterTypeChangeHandler = (event) => {
    this.#handleFilterTypeChange(event.target.value);
  };
}
