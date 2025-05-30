import AbstractView from '../framework/view/abstract-view.js';

export default class EmptyListView extends AbstractView {
  #filterType = null;

  constructor({ filterType }) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return `<p class="trip-events__msg">${this.#getMessage()}</p>`;
  }

  #getMessage() {
    switch (this.#filterType) {
      case 'EVERYTHING':
        return 'Click New Event to create your first point';
      case 'FUTURE':
        return 'There are no future events now';
      case 'PAST':
        return 'There are no past events now';
      case 'PRESENT':
        return 'There are no present events now';
      default:
        return 'There are no events now';
    }
  }
}
