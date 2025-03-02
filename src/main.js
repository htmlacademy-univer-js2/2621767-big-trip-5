import Presenter from './presenter/presenter';
import EventsModel from './model/events.js';

const eventsModel = new EventsModel();
const currentPresenter = new Presenter({eventsModel});

currentPresenter.init();
