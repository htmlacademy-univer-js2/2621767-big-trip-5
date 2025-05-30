import { render, replace, remove } from '../framework/render';
import FormEditing from '../view/form-edit-view';
import Point from '../view/point-view';
import { isEscapeKey } from '../utils';
import { MODE_TYPE, ACTION_TYPE, UPDATE_TYPE } from '../const';

export default class EventPresenter {
  #eventListContainer = null;
  #destinations = null;
  #offers = null;
  #eventComponent = null;
  #eventEditComponent = null;
  #event = null;
  #handleDataChange = null;
  #handleViewChange = null;
  #mode = MODE_TYPE.DEFAULT;

  get event() {
    return this.#event;
  }

  #onEscKeydown = (event) => {
    if (isEscapeKey(event)) {
      event.preventDefault();
      this.resetView();
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
      onRollButtonClick: this.resetView,
      onSubmitButtonClick: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
    });

    if (!prevEventComponent || !prevEventEditComponent) {
      render(this.#eventComponent, this.#eventListContainer.element);
      return;
    }

    if (this.#mode === MODE_TYPE.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    } else if (this.#mode === MODE_TYPE.EDITING) {
      replace(this.#eventEditComponent, prevEventEditComponent);
    }

    remove(prevEventComponent);
    remove(prevEventEditComponent);
  }

  destroy() {
    remove(this.#eventComponent);
    remove(this.#eventEditComponent);
    document.removeEventListener('keydown', this.#onEscKeydown);
    this.#mode = MODE_TYPE.DEFAULT;
  }

  resetView() {
    if (this.#mode !== MODE_TYPE.DEFAULT) {
      this.#eventEditComponent.reset(this.#event);
      replace(this.#eventComponent, this.#eventEditComponent);
      document.removeEventListener('keydown', this.#onEscKeydown);
      this.#mode = MODE_TYPE.DEFAULT;
    }
  }

  setSaving = () => {
    if (this.#mode === MODE_TYPE.EDITING) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isSaving: true
      });
    } else {
      this.#eventComponent.updateElement({
        isDisabled: true,
        isSaving: true
      });
    }
  };

  setDeleting = () => {
    if (this.#mode === MODE_TYPE.EDITING) {
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
    if (this.#mode === MODE_TYPE.EDITING) {
      this.#eventEditComponent.shake(() => {
        this.#eventEditComponent.updateElement({
          isDisabled: false,
          isSaving: false,
          isDeleting: false,
        });
      });
    } else if (this.#mode === MODE_TYPE.DEFAULT) {
      this.#eventComponent.shake();
    }
  };

  #handleDeleteClick = async (pointToDelete) => {
    try {
      this.setDeleting();
      await this.#handleDataChange(ACTION_TYPE.DELETE_POINT, UPDATE_TYPE.MINOR, pointToDelete);
    } catch (error) {
      this.setAborting();
    }
  };

  #handleFormSubmit = async (updatedEvent) => {
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
      this.setSaving();

      await this.#handleDataChange(
        ACTION_TYPE.UPDATE_POINT,
        updateType,
        updatedEvent
      );

    } catch (error) {
      this.setAborting();
    }
  };

  #validateEventData = (event) => {
    if (!event) {
      return false;
    }

    if (!event.type || !event.destination || event.price <= 0) {
      return false;
    }

    if (!event.dateFrom || !event.dateTo) {
      return false;
    }
    if (event.dateFrom >= event.dateTo) {
      return false;
    }

    const destinationExists = this.#destinations.some((destination) => destination.id === event.destination);
    if (!destinationExists && event.destination !== 'unknown') {
      return false;
    }

    return true;
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(ACTION_TYPE.UPDATE_POINT, UPDATE_TYPE.PATCH, {
      ...this.#event,
      isFavorite: !this.#event.isFavorite
    });
  };

  #replaceEventToForm = () => {
    this.#handleViewChange('edit', this.#event.id);
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#onEscKeydown);
    this.#mode = MODE_TYPE.EDITING;
  };
}
