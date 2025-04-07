import { render, replace, remove } from '../framework/render';
import FormEditing from '../view/form-edit-view';
import Point from '../view/point-view';
import { isEscapeKey } from '../utils';

export default class EventPresenter {
  #eventListContainer = null;
  #eventComponent = null;
  #eventEditComponent = null;
  #event = null;
  #handleDataChange = null;
  #handleViewChange = null;
  #isEventEditing = false;

  #onEscKeydown = (event) => {
    if (isEscapeKey(event)) {
      event.preventDefault();
      this.#replaceFormToEvent();
    }
  };

  constructor({eventListContainer, onDataChange, onViewChange}) {
    this.#eventListContainer = eventListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleViewChange = onViewChange;
  }

  init(event) {
    this.#event = event;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditComponent = this.#eventEditComponent;

    this.#eventComponent = new Point({
      event: this.#event,
      onEditClick: this.#replaceEventToForm,
      onFavoriteClick: this.#handleFavoriteClick
    });

    this.#eventEditComponent = new FormEditing({
      event: this.#event,
      onFormSubmit: this.#replaceFormToEvent,
      onRollButtonClick: this.#replaceFormToEvent
    });

    if (!prevEventComponent || !prevEventEditComponent) {
      render(this.#eventComponent, this.#eventListContainer);
      return;
    }

    replace(this.#eventComponent, prevEventComponent);
    remove(prevEventComponent);
    remove(prevEventEditComponent);
  }

  resetView() {
    if (this.#isEventEditing) {
      this.#replaceFormToEvent();
    }
  }

  #replaceEventToForm = () => {
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#onEscKeydown);
    this.#handleViewChange();
    this.#isEventEditing = true;
  };

  #replaceFormToEvent = () => {
    replace(this.#eventComponent, this.#eventEditComponent);
    document.removeEventListener('keydown', this.#onEscKeydown);
    this.#isEventEditing = false;
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({...this.#event, isFavourite: !this.#event.isFavourite});
  };
}
