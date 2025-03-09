import BoardPresenter from './presenter/board-presenter';
import EventsModel from './model/events-model.js';

const eventsModel = new EventsModel();
const currentPresenter = new BoardPresenter({eventsModel});

currentPresenter.init();
