import AbstractView from '../framework/view/abstract-view';

function createFailedLoadingTemplate() {
  return ('<p class="trip-events__msg">Error when receiving information on request</p>');
}

export default class FailedLoadingView extends AbstractView {
  get template() {
    return createFailedLoadingTemplate();
  }
}
