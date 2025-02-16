export default class FormCreateView {
  getTemplate() {
    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/flight.png" alt="Event type icon">
            </label>
          </div>
          <input class="event__input event__input--destination" type="text" name="event-destination" value="Geneva">
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Cancel</button>
        </header>
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
