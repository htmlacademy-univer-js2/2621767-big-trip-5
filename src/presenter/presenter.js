import { render } from '../render.js';
import Filters from '../view/filters';
import FormCreation from '../view/form-create';
import FormEditing from '../view/form-edit';
import PointEdit from '../view/point-edit';
import Point from '../view/point';
import Sorting from '../view/sorting';

export default class Presenter {
  eventListComponent = new PointEdit();

  constructor({eventsModel}) {
    this.eventsContainer = document.querySelector('.trip-events');
    this.filterContainer = document.querySelector('.trip-controls__filters');
    this.eventsModel = eventsModel;
  }

  init() {
    this.boardEvents = [...this.eventsModel.getEvents()];

    render(new Filters(), this.filterContainer);
    render(new Sorting(), this.eventsContainer);
    render(this.eventListComponent, this.eventsContainer);
    render(new FormEditing({event: this.boardEvents[0]}), this.eventListComponent.getElement());

    for (let i = 1; i < this.boardEvents.length; i++) {
      render(new Point({event: this.boardEvents[i]}), this.eventListComponent.getElement());
    }

    render(new FormCreation(), this.eventListComponent.getElement());
  }
}
