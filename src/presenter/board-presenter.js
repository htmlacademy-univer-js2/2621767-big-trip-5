import { render } from '../framework/render.js';
import { replace } from '../framework/render.js';
import FiltersView from '../view/filters-view';
import FormEditing from '../view/form-edit-view';
import PointEdit from '../view/point-edit-view';
import Point from '../view/point-view';
import SortingView from '../view/sorting-view';
import EmptyListView from '../view/empty-list-view';
import { isEscapeKey } from '../utils';
import { generateFilter } from '../mock/filter-mock';

export default class BoardPresenter {
  #eventListComponent = new PointEdit();
  #eventsContainer = null;
  #filterContainer = null;
  #eventsModel = null;
  #boardEvents = [];

  constructor({eventsModel}) {
    this.#eventsContainer = document.querySelector('.trip-events');
    this.#filterContainer = document.querySelector('.trip-controls__filters');
    this.#eventsModel = eventsModel;
  }

  init() {
    this.#boardEvents = this.#eventsModel.events;

    const currentFilters = generateFilter(this.#boardEvents);

    if (this.#boardEvents.length > 0) {
      render(new FiltersView({currentFilters}), this.#filterContainer);
      render(new SortingView(), this.#eventsContainer);
      render(this.#eventListComponent, this.#eventsContainer);

      this.#boardEvents.forEach((point) => this.#renderEvent(point));
    } else {
      render(new EmptyListView(), this.#eventsContainer);
    }
  }

  #renderEvent(event) {
    const onEscKeyDownClose = (evt) => {
      if (isEscapeKey(evt)) {
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
