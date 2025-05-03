import AbstractView from '../framework/view/abstract-view.js';

export default class EmptyListView extends AbstractView {
  constructor({ filterType }) {
    super();
    this._filterType = filterType;
  }

  get template() {
    return `<p class="trip-events__msg">${this._getMessage()}</p>`;
  }

  _getMessage() {
    switch (this._filterType) {
      case 'EVERYTHING':
        return 'Click New Event to create your first point';
      case 'FUTURE':
        return 'There are no future events now';
      case 'PAST':
        return 'There are no past events now';
      default:
        return 'There are no present events now';
    }
  }
}
