import Filters from '../view/filters';
import FormCreation from '../view/form-create';
import FormEditing from '../view/form-edit';
import PointEdit from '../view/point-edit';
import Point from '../view/point';
import Sorting from '../view/sorting';
import { render } from '../render.js';

const MAX_ROUTE_POINT_COUNT = 3;

export default class Presenter {
  PointRouteListPart = new PointEdit();

  constructor() {
    this.tripEvents = document.querySelector('.trip-events');
    this.tripControlFilters = document.querySelector('.trip-controls__filters');
  }

  init() {
    render(new Filters(), this.tripControlFilters);
    render(new Sorting(), this.tripEvents);
    render(this.PointRouteListPart, this.tripEvents);
    render(new FormEditing(), this.PointRouteListPart.getElement());
    render(new FormCreation(), this.PointRouteListPart.getElement());
    for (let i = 0; i < MAX_ROUTE_POINT_COUNT; i++) {
      render(new Point(), this.PointRouteListPart.getElement());
    }
  }
}
