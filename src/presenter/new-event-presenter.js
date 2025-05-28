import { ACTIONS, UPDATE_TYPE, FORM_TYPE, POINT } from '../const.js';
import { remove, render, RenderPosition } from '../framework/render';
import FormEditing from '../view/form-edit-view';
import { isEscapeKey } from '../utils';

export default class NewEventPresenter {
  #listComponent = null;
  #pointNewComponent = null;
  #pointsListModel = null; // Если NewEventPresenter должен иметь прямой доступ к модели
  #onDataChange = null;
  #onDestroy = null;

  constructor({ listComponent, pointsListModel, onDataChange, onDestroy }) {
    this.#listComponent = listComponent;
    this.#pointsListModel = pointsListModel; // Сохраняем модель
    this.#onDataChange = onDataChange;
    this.#onDestroy = onDestroy;
  }

  init(destinations, offers) {
    console.log('NewEventPresenter init called!');

    if (this.#pointNewComponent) {
      console.log('New event form already open, returning.');
      return;
    }

    console.log('Creating FormCreation with destinations:', destinations.length, 'offers:', Object.keys(offers).length);

    this.#pointNewComponent = new FormEditing({
      event: { ...POINT },
      destinations: destinations,
      offers: offers,
      onRollButtonClick: this.#handleReset, // This is for the rollup button in EDIT mode
      onSubmitButtonClick: this.#handleSubmit,
      onDeleteClick: this.#handleReset, // This is for the DELETE button in EDIT mode (though 'Reset' is used for CREATE)
      onResetClick: this.#handleReset, // <--- ADD THIS LINE FOR THE CANCEL BUTTON IN CREATE MODE
      type: FORM_TYPE.CREATE,
    });

    render(this.#pointNewComponent, this.#listComponent, RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#onEscKeydown);

    console.log('FormCreation rendered to DOM');
  }

  // --- ИЗМЕНЕНИЕ: setAborting теперь только трясет и сбрасывает флаги состояния ---
  setAborting = () => {
    if (this.#pointNewComponent) {
      // После тряски сбрасываем состояние isDisabled, isSaving, isDeleting
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
    console.log('Cancel clicked, destroying form.');
    this.destroy({ isCanceled: true });
  };


  // --- Ключевое изменение: handleSubmit больше не вызывает destroy() ---
  #handleSubmit = async (formData) => {
    console.log('NewEventPresenter: Form submitted with data:', formData);

    this.#pointNewComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });

    // Вызываем callback для добавления события.
    // Обработка ошибок и вызов destroy/setAborting теперь происходит в BoardPresenter.#actions.
    this.#onDataChange(ACTIONS.ADD_POINT, UPDATE_TYPE.MINOR, formData);

    // console.log('NewEventPresenter: Event added successfully'); // ЭТО БУДЕТ ВЫВЕДЕНО ДО ПОЛУЧЕНИЯ ОТВЕТА ОТ СЕРВЕРА
    // this.destroy({ isCanceled: false, newPoint: formData }); // <--- ЭТО УБРАНО ОТСЮДА
  };


  // --- destroy() теперь вызывается из BoardPresenter после обработки ответа API ---
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
