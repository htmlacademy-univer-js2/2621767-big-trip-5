import TripPresenter from './presenter/trip-presenter.js';

const tripContainer = document.querySelector('.trip-events');
const tripPresenter = new TripPresenter(tripContainer);
tripPresenter.init();
