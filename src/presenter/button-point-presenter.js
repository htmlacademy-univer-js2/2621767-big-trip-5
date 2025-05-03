import { render } from '../framework/render';
import ButtonPointView from '../view/button-point-view';

export default class ButtonPointPresenter {
  #container = null;
  #button = null;
  #clickAction = null;

  constructor({container}) {
    this.#container = container;
  }

  init({onNewPointButtonClick}) {
    this.#clickAction = onNewPointButtonClick;

    this.#button = new ButtonPointView({onNewPointButtonClick: this.#onNewPointButtonClick});
    render(this.#button, this.#container);
  }

  enableButton() {
    this.#button.setDisabled(false);
  }

  disableButton() {
    this.#button.setDisabled(true);
  }

  #onNewPointButtonClick = () => {
    this.#clickAction();
  };
}
