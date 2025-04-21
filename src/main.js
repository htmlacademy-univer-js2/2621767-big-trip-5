import BoardPresenter from './presenter/board-presenter';
import PointsListModel from './model/points-list-model.js';

const pointsListModel = new PointsListModel();
const eventsContainer = document.querySelector('.trip-events');
const filterContainer = document.querySelector('.trip-controls__filters');

const currentPresenter = new BoardPresenter({
  eventsContainer,
  filterContainer,
  pointsListModel
});

currentPresenter.init();
