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

  // Изменено: теперь этот метод не просто заменяет форму, но и вызывает resetView,
  // что соответствует поведению при закрытии формы без сохранения.
  #onEscKeydown = (event) => {
    if (isEscapeKey(event)) {
      event.preventDefault();
      this.resetView(); // Используем resetView для сброса и закрытия формы
      // document.removeEventListener('keydown', this.#onEscKeydown); // Это уже делается в resetView -> #replaceFormToEvent
    }
  };

  constructor({ destinations, offers, eventListContainer, onDataChange, onViewChange }) {
    this.#destinations = destinations;
    this.#offers = offers;
    this.#eventListContainer = eventListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleViewChange = onViewChange;

    this.resetView = this.resetView.bind(this);
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
      // Это условие означает, что данные еще не загружены или произошла ошибка загрузки.
      // В таком случае, возможно, не стоит пытаться рендерить компоненты.
      // Однако, если это происходит при инициализации новой точки,
      // то она должна быть создана с пустыми данными для выбора.
      // Если это существующая точка, и нет данных, то, вероятно, проблема.
      // В рамках текущей задачи просто оставляем как есть, но это место стоит обдумать.
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
      onRollButtonClick: this.resetView, // Изменено: используем resetView
      onSubmitButtonClick: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
      // onFormClose: this.closeEditForm // Эта строка не нужна, так как onRollButtonClick теперь делает то же самое
    });

    if (!prevEventComponent || !prevEventEditComponent) {
      render(this.#eventComponent, this.#eventListContainer.element);
      return;
    }

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
    document.removeEventListener('keydown', this.#onEscKeydown); // Это уже правильно.
    this.#mode = MODE.DEFAULT;
  }

  // Этот метод теперь является центральным для сброса и закрытия формы
  resetView() {
    // В отличие от примера, у вас есть reset(this.#event) для формы,
    // что позволяет ей вернуться в исходное состояние при отмене.
    // Если mode === MODE.DEFAULT, это значит, что форма уже не открыта,
    // или это не режим редактирования, поэтому можно безопасно выйти.
    if (this.#mode !== MODE.DEFAULT) {
      this.#eventEditComponent.reset(this.#event); // Сбрасываем форму к исходным данным
      replace(this.#eventComponent, this.#eventEditComponent); // Заменяем форму обратно на компонент точки
      document.removeEventListener('keydown', this.#onEscKeydown); // Удаляем слушатель
      this.#mode = MODE.DEFAULT;
    }
  }

  setSaving = () => {
    // Убедитесь, что isDisabled и isSaving применяются к компоненту формы
    // а не к компоненту точки, когда форма открыта.
    if (this.#mode === MODE.EDITING) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isSaving: true
      });
    } else {
      this.#eventComponent.updateElement({ // если это какой-то редкий случай, когда сохранение происходит не из формы
        isDisabled: true,
        isSaving: true
      });
    }
  };

  setDeleting = () => {
    // При удалении, если форма открыта, эффект должен быть на форме
    if (this.#mode === MODE.EDITING) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true
      });
    } else {
      this.#eventComponent.updateElement({
        isDisabled: true,
        isDeleting: true
      });
    }
  };

  setAborting = () => {
    if (this.#mode === MODE.EDITING) {
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
      this.setDeleting(); // Используем новый setDeleting
      await this.#handleDataChange(ACTIONS.DELETE_POINT, UPDATE_TYPE.MINOR, pointToDelete);
    } catch (err) {
      console.error('Delete failed:', err);
      this.setAborting();
    }
  };

  #handleFormSubmit = async (updatedEvent) => {
    // Validate the event data before processing
    if (!this.#validateEventData(updatedEvent)) {
      this.setAborting();
      return;
    }

    const isMinorUpdate =
      this.#event.dateFrom?.getTime() === updatedEvent.dateFrom?.getTime() &&
      this.#event.dateTo?.getTime() === updatedEvent.dateTo?.getTime() &&
      this.#event.price === updatedEvent.price &&
      this.#event.type === updatedEvent.type &&
      this.#event.destination === updatedEvent.destination &&
      JSON.stringify((this.#event.offers || []).sort()) === JSON.stringify((updatedEvent.offers || []).sort());

    const updateType = isMinorUpdate ? UPDATE_TYPE.PATCH : UPDATE_TYPE.MINOR;

    try {
      this.setSaving(); // Используем новый setSaving

      await this.#handleDataChange(
        ACTIONS.UPDATE_POINT,
        updateType,
        updatedEvent
      );

    } catch (err) {
      console.error('Save failed:', err);
      this.setAborting();
    }
  };

  #validateEventData = (event) => {
    if (!event) return false;

    // Check required fields
    if (!event.type || !event.destination || event.price <= 0) return false;

    // Check dates
    if (!event.dateFrom || !event.dateTo) return false;
    if (event.dateFrom >= event.dateTo) return false;

    // Check if destination exists
    const destinationExists = this.#destinations.some(dest => dest.id === event.destination);
    if (!destinationExists && event.destination !== 'unknown') return false; // Изменил "unknown" на конкретный ID

    return true;
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(ACTIONS.UPDATE_POINT, UPDATE_TYPE.PATCH, {
      ...this.#event,
      isFavorite: !this.#event.isFavorite
    });
  };

  #replaceEventToForm = () => {
    this.#handleViewChange('edit', this.#event.id);
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#onEscKeydown);
    this.#mode = MODE.EDITING;
  };
}
