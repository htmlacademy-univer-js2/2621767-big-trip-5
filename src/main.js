import BoardPresenter from './presenter/board-presenter';
import PointsListModel from './model/points-list-model';
import FilterPresenter from './presenter/filter-presenter';
import FilterModel from './model/filter-model.js';
import ButtonPointPresenter from './presenter/button-point-presenter.js';
import { AUTHORIZATION, API_URL } from './const.js';
import EventsApiService from './service/events-api-service';
import TripInfoPresenter from './presenter/trip-info-presenter';

(async () => {
  const eventsApiService = new EventsApiService(API_URL, AUTHORIZATION);
  const pointsListModel = new PointsListModel({ pointsApiService: eventsApiService });

  const buttonPointPresenter = new ButtonPointPresenter({
    container: document.querySelector('.trip-main')
  });

  const filterModel = new FilterModel();

  const boardPresenter = new BoardPresenter({
    eventsContainer: document.querySelector('.trip-events'),
    filterModel,
    pointsListModel,
    buttonPointPresenter
  });

  const filterPresenter = new FilterPresenter({
    filterContainer: document.querySelector('.trip-controls__filters'),
    filterModel,
    pointsListModel
  });

  filterPresenter.init();
  await boardPresenter.init();
  buttonPointPresenter.init({ onNewPointButtonClick: boardPresenter.onNewPointButtonClick });

  const tripInfoContainer = document.querySelector('.trip-main');
  const tripInfoPresenter = new TripInfoPresenter({
    container: tripInfoContainer,
    pointsModel: pointsListModel
  });
  tripInfoPresenter.init();
})();
