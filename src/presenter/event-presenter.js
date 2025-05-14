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

  #onEscKeydown = (event) => {
    if (isEscapeKey(event)) {
      event.preventDefault();
      this.#replaceFormToEvent();
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
      onRollButtonClick: this.#replaceFormToEvent,
      onSubmitButtonClick: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick
    });

    if (!prevEventComponent || !prevEventEditComponent) {
      render(this.#eventComponent, this.#eventListContainer.element);
      return;
    }

    if (this.#mode === MODE.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    }

    if (this.#mode === MODE.EDITING) {
      replace(this.#eventEditComponent, prevEventEditComponent);
      this.#mode = MODE.DEFAULT;
    }

    remove(prevEventComponent);
    remove(prevEventEditComponent);
  }

  destroy() {
    if (this.#eventComponent) {
      remove(this.#eventComponent);
    }
    if (this.#eventEditComponent) {
      remove(this.#eventEditComponent);
    }
    document.removeEventListener('keydown', this.#onEscKeydown);
  }

  resetView() {
    if (this.#mode !== MODE.DEFAULT) {
      this.#replaceFormToEvent();
    }
  }

  #handleDeleteClick = (pointToDelete) => {
    this.#handleDataChange(ACTIONS.DELETE_POINT, UPDATE_TYPE.MINOR, pointToDelete);
    this.#replaceFormToEvent();
  };

  #handleFormSubmit = (updatedEvent) => {
    this.#handleDataChange(ACTIONS.UPDATE_POINT, UPDATE_TYPE.MINOR, {
      ...updatedEvent,
      offers: Array.isArray(updatedEvent.offers) ? updatedEvent.offers : []
    });
    this.#replaceFormToEvent();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(ACTIONS.UPDATE_POINT, UPDATE_TYPE.PATCH, {
      ...this.#event,
      isFavorite: !this.#event.isFavorite
    });
  };

  #replaceEventToForm = () => {
    this.#handleViewChange();
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#onEscKeydown);
    this.#mode = MODE.EDITING;
  };

  #replaceFormToEvent = () => {
    if (this.#eventEditComponent) {
      this.#eventEditComponent.reset(this.#event);
    }
    replace(this.#eventComponent, this.#eventEditComponent);
    document.removeEventListener('keydown', this.#onEscKeydown);
    this.#mode = MODE.DEFAULT;
  };
}
