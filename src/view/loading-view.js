import AbstractView from '../framework/view/abstract-view';

function createLoadingTemplate() {
  return ('<p class="trip-events__msg">Loading...</p>');
}

export default class LoadingView extends AbstractView {
  get template() {
    return createLoadingTemplate();
  }
}
