// src/presenter/button-point-presenter.js
import { render } from '../framework/render';
import ButtonPointView from '../view/button-point-view'; // Или NewPointButtonView

export default class ButtonPointPresenter {
  #container = null;
  #button = null;
  #clickAction = null;

  constructor({container}) {
    this.#container = container;
  }

  init({onNewPointButtonClick}) {
    this.#clickAction = onNewPointButtonClick;

    // Важно: render вызывается ТОЛЬКО ЗДЕСЬ!
    if (!this.#button) { // Проверяем, чтобы не рендерить дважды, хотя при правильном вызове это не нужно
      this.#button = new ButtonPointView({onNewPointButtonClick: this.#onNewPointButtonClick});
      render(this.#button, this.#container);
    }
  }

  enableButton() {
    if (this.#button) { // Добавлена проверка, чтобы не было ошибки, если #button ещё null
      this.#button.setDisabled(false);
    }
  }

  disableButton() {
    if (this.#button) { // Добавлена проверка
      this.#button.setDisabled(true);
    }
  }

  #onNewPointButtonClick = () => {
    this.#clickAction();
  };
}
