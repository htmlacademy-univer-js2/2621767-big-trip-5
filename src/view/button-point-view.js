import AbstractView from '../framework/view/abstract-view';

function createNewEventButtonTemplate() {
  return `
    <button class="trip-main__event-add-btn btn btn--big btn--yellow" type="button">
      New event
    </button>
  `;
}

export default class ButtonPointView extends AbstractView {
  #newPointClickAction = null;

  constructor({ onNewPointButtonClick }) {
    super();
    this.#newPointClickAction = onNewPointButtonClick;
    this.element.addEventListener('click', this.#handleNewPointButtonClick);
  }

  get template() {
    return createNewEventButtonTemplate();
  }

  setDisabled(disabled) {
    this.element.disabled = disabled;
  }

  #handleNewPointButtonClick = (event) => {
    event.preventDefault();
    this.#newPointClickAction();
  };
}
