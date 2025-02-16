export default class PointView {
  getTemplate() {
    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="2019-03-18">MAR 18</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/taxi.png" alt="Event type icon">
          </div>
          <h3 class="event__title">Taxi Amsterdam</h3>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
      </li>
    `;
  }

  getElement() {
    if (!this.element) {
      const div = document.createElement('div');
      div.innerHTML = this.getTemplate();
      this.element = div.firstElementChild;
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
