import { createElement } from '../render';

function createPointRouteListTemplate() {
  return '<ul class="trip-events__list"></ul>';
}

export default class PointRouteList {
  getTemplate() {
    return createPointRouteListTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
