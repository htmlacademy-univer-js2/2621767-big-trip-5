// src/presenter/event-presenter.js

import { render, replace, remove } from '../framework/render';
import FormEditing from '../view/form-edit-view';
import Point from '../view/point-view';
import { isEscapeKey } from '../utils';
import { MODE, ACTIONS, UPDATE_TYPE } from '../const';

export default class EventPresenter {
  #eventListContainer = null;
  #destinations = null;
  #offers = null;
  #eventComponent = null;
  #eventEditComponent = null;
  #event = null;
  #handleDataChange = null;
  #handleViewChange = null;
  #mode = MODE.DEFAULT;

  get event() {
    return this.#event;
  }

  #onEscKeydown = (event) => {
    if (isEscapeKey(event)) {
      event.preventDefault();
      // При сбросе формы редактирования, передаем оригинальные данные точки
      this.#replaceFormToEvent(true); // Передаем true, чтобы сбросить форму
    }
  };

  constructor({ destinations, offers, eventListContainer, onDataChange, onViewChange }) {
    this.#destinations = destinations;
    this.#offers = offers;
    this.#eventListContainer = eventListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleViewChange = onViewChange;
  }

  init(event) {
    const prevEventComponent = this.#eventComponent;
    const prevEventEditComponent = this.#eventEditComponent;

    this.#event = {
      ...event,
      type: event.type || 'flight',
      destination: event.destination || '',
      offers: event.offers || []
    };

    if (!this.#destinations.length) {
      // Это может произойти, если destinations не были загружены
      // Лучше добавить обработку ошибки или индикатор загрузки
      return;
    }

    this.#eventComponent = new Point({
      event: {
        ...this.#event,
        offers: Array.isArray(this.#event.offers) ? this.#event.offers : []
      },
      destinations: this.#destinations,
      offers: this.#offers,
      onEditClick: this.#replaceEventToForm,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#eventEditComponent = new FormEditing({
      event: this.#event,
      destinations: this.#destinations,
      offers: this.#offers,
      onRollButtonClick: () => this.#replaceFormToEvent(true), // Сброс при нажатии на RollUp
      onSubmitButtonClick: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
      onFormClose: this.closeEditForm
    });

    if (!prevEventComponent || !prevEventEditComponent) {
      render(this.#eventComponent, this.#eventListContainer.element);
      return;
    }

    // Логика замены компонентов в зависимости от текущего режима
    if (this.#mode === MODE.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    } else if (this.#mode === MODE.EDITING) {
      replace(this.#eventEditComponent, prevEventEditComponent);
    }

    remove(prevEventComponent);
    remove(prevEventEditComponent);
  }

  destroy() {
    remove(this.#eventComponent);
    remove(this.#eventEditComponent);
    document.removeEventListener('keydown', this.#onEscKeydown);
    this.#mode = MODE.DEFAULT;
  }

  resetView() {
    if (this.#mode !== MODE.DEFAULT) {
      this.#replaceFormToEvent(true); // Сбрасываем форму при resetView
    }
  }

  setAborting = () => {
    if (this.#mode === MODE.EDITING) {
      // Использование колбэка для сброса состояния формы после анимации
      this.#eventEditComponent.shake(() => {
        this.#eventEditComponent.updateElement({
          isDisabled: false,
          isSaving: false,
          isDeleting: false,
        });
      });
    } else if (this.#mode === MODE.DEFAULT) {
      this.#eventComponent.shake();
    }
  };

  #handleDeleteClick = async (pointToDelete) => {
    try {
      await this.#handleDataChange(ACTIONS.DELETE_POINT, UPDATE_TYPE.MINOR, pointToDelete);
    } catch (err) {
      this.setAborting();
    }
  };

  // src/presenter/event-presenter.js

  #handleFormSubmit = async (updatedEvent) => {
    const isMinorUpdate =
      this.#event.dateFrom.getTime() === updatedEvent.dateFrom.getTime() &&
      this.#event.dateTo.getTime() === updatedEvent.dateTo.getTime() &&
      this.#event.price === updatedEvent.price &&
      this.#event.type === updatedEvent.type &&
      this.#event.destination === updatedEvent.destination &&
      JSON.stringify(this.#event.offers.sort()) === JSON.stringify(updatedEvent.offers.sort());

    const updateType = isMinorUpdate ? UPDATE_TYPE.PATCH : UPDATE_TYPE.MINOR;

    try {
      await this.#handleDataChange(
        ACTIONS.UPDATE_POINT,
        updateType,
        updatedEvent
      );
      // The form will be closed automatically when the board re-renders
      // with the updated data. Do not call this.closeEditForm() here.

    } catch (err) {
      // If the request fails, the form should remain open in an error state.
      this.setAborting();
    }
  };

  closeEditForm = () => {
    this.#replaceFormToEvent();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(ACTIONS.UPDATE_POINT, UPDATE_TYPE.PATCH, {
      ...this.#event,
      isFavorite: !this.#event.isFavorite
    });
  };

  #replaceEventToForm = () => {
    this.#handleViewChange('edit', this.#event.id); // Уведомляем BoardPresenter
    // Рендерим форму редактирования
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#onEscKeydown);
    this.#mode = MODE.EDITING;
  };

  #replaceFormToEvent = (shouldReset = false) => {
    if (this.#mode === MODE.DEFAULT) {
      return;
    }

    if (shouldReset) {
      // Сбросить форму редактирования до исходных значений
      this.#eventEditComponent.reset(this.#event);
    }
    replace(this.#eventComponent, this.#eventEditComponent);
    document.removeEventListener('keydown', this.#onEscKeydown);
    this.#mode = MODE.DEFAULT;
  };
}
