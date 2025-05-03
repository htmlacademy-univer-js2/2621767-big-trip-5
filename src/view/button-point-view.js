import AbstractView from '../framework/view/abstract-view';

function createNewEventButtonTemplate() {
  return `<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">
    New event</button>`;
}

export default class ButtonPointView extends AbstractView {
  #clickAction = null;

  constructor({onNewPointButtonClick}) {
    super();
    this.#clickAction = onNewPointButtonClick;
    this.element.addEventListener('click', this.#onNewPointButtonClick);
  }

  get template() {
    return createNewEventButtonTemplate();
  }

  setDisabled = (disabled) => {
    this.element.disabled = disabled;
  };

  // Исправленный обработчик
  #onNewPointButtonClick = (evt) => {
    evt.preventDefault();
    this.#clickAction();
  };
}
