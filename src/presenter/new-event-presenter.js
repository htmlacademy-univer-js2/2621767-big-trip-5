import {ACTIONS, UPDATE_TYPE, FORM_TYPE, POINT} from '../const.js';
import { remove, render, RenderPosition } from '../framework/render';
import FormEditing from '../view/form-edit-view.js';

export default class NewEventPresenter {
  #listComponent = null;
  #pointNewComponent = null;
  #pointsListModel = null;
  #onDataChange = null;
  #onDestroy = null;

  constructor({listComponent, pointsListModel: pointsListModel, onDataChange, onDestroy}) {
    this.#listComponent = listComponent;
    this.#pointsListModel = pointsListModel;
    this.#onDataChange = onDataChange;
    this.#onDestroy = onDestroy;
  }

  init() {
    if (this.#pointNewComponent) {
      return;
    }

    this.#pointNewComponent = new FormEditing({
      event: { ...POINT},
      destinations: this.#pointsListModel.destinations,
      offers: this.#pointsListModel.offers,
      onRollButtonClick: this.#handleReset,
      onSubmitButtonClick: this.#handleSubmit,
      onResetClick: this.#handleReset,
      type: FORM_TYPE.CREATE,
    });

    render(this.#pointNewComponent, this.#listComponent, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#onEscKeydown);
  }

  setAborting = () => {
    if (this.#pointNewComponent) {
      this.#pointNewComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    }
  };

  #onEscKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.destroy();
    }
  };

  #handleReset = () => {
    this.destroy();
  };

  setSavingState = (isSaving) => {
    if (this.#pointNewComponent) {
      this.#pointNewComponent.updateElement({
        isDisabled: isSaving,
        isSaving: isSaving
      });
    }
  };

  #handleSubmit = async (point) => {
    try {
      this.setSavingState(true);

      await this.#onDataChange(ACTIONS.ADD_POINT, UPDATE_TYPE.MINOR, point);

    } catch (error) {
      this.#pointNewComponent.shake();
      this.setSavingState(false);
      this.#pointNewComponent.showError('Не удалось сохранить. Попробуйте ещё раз.');
    }
  };

  destroy = ({isCanceled = true, newPoint} = {}) => {
    if (this.#pointNewComponent === null) {
      return;
    }

    remove(this.#pointNewComponent);
    this.#pointNewComponent = null;
    document.removeEventListener('keydown', this.#onEscKeydown);

    this.#onDestroy({isCanceled, newPoint});
  };
}
