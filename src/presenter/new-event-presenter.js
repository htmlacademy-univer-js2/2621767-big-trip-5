// src/presenter/new-event-presenter.js

import { ACTIONS, UPDATE_TYPE, FORM_TYPE, POINT } from '../const.js';
import { remove, render, RenderPosition } from '../framework/render';
import FormCreation from '../view/form-edit-view';
import { isEscapeKey } from '../utils';

export default class NewEventPresenter {
  #listComponent = null;
  #pointNewComponent = null;
  #pointsListModel = null;
  #onDataChange = null;
  #onDestroy = null;

  constructor({ listComponent, pointsListModel, onDataChange, onDestroy }) {
    this.#listComponent = listComponent;
    this.#pointsListModel = pointsListModel;
    this.#onDataChange = onDataChange;
    this.#onDestroy = onDestroy;
  }

  // init now takes destinations and offers directly, allowing BoardPresenter to pass them
  init(destinations, offers) {
    console.log('NewEventPresenter init called!');

    if (this.#pointNewComponent) {
      console.log('New event form already open, returning.');
      return;
    }

    console.log('Creating FormCreation with destinations:', destinations.length, 'offers:', Object.keys(offers).length);

    // Создаем новый экземпляр FormCreation
    this.#pointNewComponent = new FormCreation({
      event: { ...POINT }, // Используйте ваш пустой объект POINT
      destinations: destinations,
      offers: offers,
      onRollButtonClick: this.#handleReset,
      onSubmitButtonClick: this.#handleSubmit,
      onResetClick: this.#handleReset,
      type: FORM_TYPE.CREATE,
    });

    // Рендерим форму в начало списка
    render(this.#pointNewComponent, this.#listComponent, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#onEscKeydown);

    console.log('FormCreation rendered to DOM');
  }

  setAborting = () => {
    if (this.#pointNewComponent) {
      this.#pointNewComponent.shake(() => {
        this.#pointNewComponent.updateElement({
          isDisabled: false,
          isSaving: false,
          isDeleting: false,
        });
      }, '.event--edit');
    }
  };

  #onEscKeydown = (event) => {
    if (isEscapeKey(event)) {
      event.preventDefault();
      this.destroy({ isCanceled: true });
    }
  };

  #handleReset = () => {
    this.destroy({ isCanceled: true });
  };

  #handleSubmit = async (formData) => {
    console.log('NewEventPresenter: Form submitted with data:', formData);

    try {
      this.#pointNewComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });

      console.log('NewEventPresenter: Calling onDataChange');

      // Вызываем callback для добавления события
      await this.#onDataChange(ACTIONS.ADD_POINT, UPDATE_TYPE.MINOR, formData);

      console.log('NewEventPresenter: Event added successfully');

      // Если успешно - уничтожаем форму с флагом что событие создано
      this.destroy({ isCanceled: false, newPoint: formData });

    } catch (error) {
      console.error('NewEventPresenter: Error creating event:', error);
      this.setAborting();
    }
  };

  destroy = ({ isCanceled = true, newPoint } = {}) => {
    console.log('NewEventPresenter: destroy called, isCanceled:', isCanceled);

    if (this.#pointNewComponent === null) {
      console.log('NewEventPresenter: already destroyed');
      return;
    }

    // Удаляем компонент из DOM
    remove(this.#pointNewComponent);
    this.#pointNewComponent = null;

    // Удаляем обработчик событий
    document.removeEventListener('keydown', this.#onEscKeydown);

    console.log('NewEventPresenter: calling onDestroy callback');

    // Уведомляем BoardPresenter о завершении
    this.#onDestroy({ isCanceled, newPoint });
  };
}
