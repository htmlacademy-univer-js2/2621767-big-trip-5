import { ACTION_TYPE, UPDATE_TYPE, FORM_TYPE, BLANK_POINT } from '../const';
import { remove, render, RenderPosition } from '../framework/render';
import FormEditing from '../view/form-edit-view';
import { isEscapeKey } from '../utils';

export default class NewEventPresenter {
  #listComponent = null;
  #pointNewComponent = null;
  #pointsModel = null;
  #onDataChange = null;
  #onDestroy = null;

  constructor({ listComponent, pointsModel, onDataChange, onDestroy }) {
    this.#listComponent = listComponent;
    this.#pointsModel = pointsModel;
    this.#onDataChange = onDataChange;
    this.#onDestroy = onDestroy;
  }

  init(destinations, offers) {
    if (this.#pointNewComponent) {
      return;
    }

    this.#pointNewComponent = new FormEditing({
      event: { ...BLANK_POINT },
      destinations: destinations,
      offers: offers,
      onRollButtonClick: this.#handleReset,
      onSubmitButtonClick: this.#handleSubmit,
      onDeleteClick: this.#handleReset,
      onResetClick: this.#handleReset,
      type: FORM_TYPE.CREATE,
    });

    render(this.#pointNewComponent, this.#listComponent, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#onEscKeydown);
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
    this.#pointNewComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });

    this.#onDataChange(ACTION_TYPE.ADD_POINT, UPDATE_TYPE.MINOR, formData);
  };

  destroy = ({ isCanceled = true, newPoint } = {}) => {
    if (this.#pointNewComponent === null) {
      return;
    }

    remove(this.#pointNewComponent);
    document.removeEventListener('keydown', this.#onEscKeydown);

    this.#pointNewComponent = null;

    if (this.#onDestroy) {
      this.#onDestroy({ isCanceled, newPoint });
    }
  };
}
