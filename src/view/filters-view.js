import AbstractView from '../framework/view/abstract-view.js';

const DEFAULT_FILTER = 'everything';

const createFiltersTemplate = (filters) => `<form class="trip-filters" action="#" method="get">
    ${filters.map((filter) =>`<div class="trip-filters__filter">
      <input id="filter-${filter.name}" class="trip-filters__filter-input visually-hidden" type="radio" name="trip-filter" value="${filter.name}"
      ${filter.count === 0 ? 'disabled' : ''} ${filter.name === DEFAULT_FILTER ? 'checked' : ''}>
      <label class="trip-filters__filter-label" for="filter-${filter.name}">${filter.name}</label>
    </div>`).join('')}
  </form>`;

export default class Filters extends AbstractView {
  #filters = null;

  constructor({currentFilters = []} = {}) {
    super();
    this.#filters = currentFilters;
  }

  get template() {
    return createFiltersTemplate(this.#filters);
  }
}
