import { render } from '../framework/render.js';
import { replace } from '../framework/render.js';
import FiltersView from '../view/filters-view';
//import FormCreation from '../view/form-create-view';
import FormEditing from '../view/form-edit-view';
import PointEdit from '../view/point-edit-view';
import Point from '../view/point-view';
import SortingView from '../view/sorting-view';

export default class BoardPresenter {
  #eventListComponent = new PointEdit();
  #eventsContainer = null;
  #filterContainer = null;
  #eventsModel = null;

  constructor({eventsModel}) {
    this.#eventsContainer = document.querySelector('.trip-events');
    this.#filterContainer = document.querySelector('.trip-controls__filters');
    this.#eventsModel = eventsModel;
  }

  init() {
    this.boardEvents = [...this.#eventsModel.events];

    render(new FiltersView(), this.#filterContainer);
    render(new SortingView(), this.#eventsContainer);
    render(this.#eventListComponent, this.#eventsContainer);

    for (let i = 0; i < this.boardEvents.length; i++) {
      this.#renderEvent(this.boardEvents[i]);
    }

    //render(new FormCreation(), this.#eventListComponent.element);
  }

  #renderEvent(event) {
    const onEscKeyDownClose = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        replaceFormToEvent();
        document.removeEventListener('keydown', onEscKeyDownClose);
      }
    };

    const eventComponent = new Point({
      event,
      onEditClick: () => {
        replaceEventToForm();
        document.addEventListener('keydown', onEscKeyDownClose);
      }
    });

    const eventEditComponent = new FormEditing({
      event,
      onFormSubmit: () => {
        replaceFormToEvent();
        document.removeEventListener('keydown', onEscKeyDownClose);
      }
    });

    function replaceEventToForm() {
      replace(eventEditComponent, eventComponent);
    }

    function replaceFormToEvent() {
      replace(eventComponent, eventEditComponent);
    }

    render(eventComponent, this.#eventListComponent.element);
  }
}
