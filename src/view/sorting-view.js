export default class SortingView {
  getTemplate() {
    return `
      <form class="trip-events__trip-sort trip-sort" action="#" method="get">
        <div class="trip-sort__item trip-sort__item--day">
          <input id="sort-day" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-day" checked>
          <label class="trip-sort__btn" for="sort-day">Day</label>
        </div>
        <div class="trip-sort__item trip-sort__item--price">
          <input id="sort-price" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-price">
          <label class="trip-sort__btn" for="sort-price">Price</label>
        </div>
      </form>
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
