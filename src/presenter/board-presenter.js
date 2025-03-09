import { render } from '../render.js';
import FiltersView from '../view/filters-view';
//import FormCreation from '../view/form-create-view';
//import FormEditing from '../view/form-edit-view';
import PointEdit from '../view/point-edit-view';
import Point from '../view/point-view';
import SortingView from '../view/sorting-view';

export default class BoardPresenter {
  eventListComponent = new PointEdit();

  constructor({eventsModel}) {
    this.eventsContainer = document.querySelector('.trip-events');
    this.filterContainer = document.querySelector('.trip-controls__filters');
    this.eventsModel = eventsModel;
  }

  init() {
    this.boardEvents = [...this.eventsModel.getEvents()];

    render(new FiltersView(), this.filterContainer);
    render(new SortingView(), this.eventsContainer);
    render(this.eventListComponent, this.eventsContainer);

    for (let i = 1; i < this.boardEvents.length; i++) {
      render(new Point({event: this.boardEvents[i]}), this.eventListComponent.getElement());
    }
  }
}
