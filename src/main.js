import BoardPresenter from './presenter/board-presenter';
import EventsModel from './model/events-model.js';

const eventsModel = new EventsModel();
const eventsContainer = document.querySelector('.trip-events');
const filterContainer = document.querySelector('.trip-controls__filters');

const currentPresenter = new BoardPresenter({
  eventsContainer,
  filterContainer,
  eventsModel
});

currentPresenter.init();
