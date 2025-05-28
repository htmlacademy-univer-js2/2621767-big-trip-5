import { render } from '../framework/render';
import ButtonPointView from '../view/button-point-view';

export default class ButtonPointPresenter {
  #container = null;
  #buttonComponent = null;
  #newPointClickAction = null;

  constructor({ container }) {
    this.#container = container;
  }

  init({ onNewPointButtonClick }) {
    this.#newPointClickAction = onNewPointButtonClick;

    if (!this.#buttonComponent) {
      this.#buttonComponent = new ButtonPointView({ onNewPointButtonClick: this.#handleNewPointButtonClick });
      render(this.#buttonComponent, this.#container);
    }
  }

  enableButton() {
    if (this.#buttonComponent) {
      this.#buttonComponent.setDisabled(false);
    }
  }

  disableButton() {
    if (this.#buttonComponent) {
      this.#buttonComponent.setDisabled(true);
    }
  }

  #handleNewPointButtonClick = () => {
    this.#newPointClickAction();
  };
}
