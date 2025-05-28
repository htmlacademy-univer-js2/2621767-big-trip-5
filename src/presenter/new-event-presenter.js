import { ACTIONS, UPDATE_TYPE, FORM_TYPE, POINT } from '../const.js';
import { remove, render, RenderPosition } from '../framework/render';
import FormCreation from '../view/form-edit-view'; // Убедитесь, что FormCreation = FormEditing у вас
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

    this.#pointNewComponent = new FormCreation({
      event: { ...POINT }, // Используйте ваш пустой объект POINT
      destinations: destinations,
      offers: offers,
      onRollButtonClick: this.#handleReset, // Для стрелки и кнопки "Cancel"
      onSubmitButtonClick: this.#handleSubmit,
      onDeleteClick: this.#handleReset, // Кнопка "Reset" в новой форме также отмена
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
    console.log('NewEventPresenter: destroy called, isCanceled:', isCanceled);

    if (this.#pointNewComponent === null) {
      console.log('NewEventPresenter: already destroyed');
      return;
    }

    remove(this.#pointNewComponent);
    this.#pointNewComponent = null;

    document.removeEventListener('keydown', this.#onEscKeydown);

    console.log('NewEventPresenter: calling onDestroy callback');

    this.#onDestroy({ isCanceled, newPoint });
  };
}
