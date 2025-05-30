import Observable from '../framework/observable';
import { FILTER_TYPE } from '../const';

export default class FilterModel extends Observable {
  #currentFilter = FILTER_TYPE.EVERYTHING;

  get filter() {
    return this.#currentFilter;
  }

  setFilter(updateType, filter) {
    this.#currentFilter = filter;
    this._notify(updateType, filter);
  }
}

