import { isFutureEvent, isPastEvent, isPresentEvent } from './date-utils.js';

const AUTHORIZATION = 'Basic vikaapi1234567';
const API_URL = 'https://24.objects.htmlacademy.pro/big-trip';

const FILTER_TYPE = {
  EVERYTHING:'EVERYTHING',
  FUTURE:'FUTURE',
  PRESENT: 'PRESENT',
  PAST:'PAST',
};

const LIST_MESSAGES = {
  [FILTER_TYPE.EVERYTHING]: 'Click New Event to create your first point',
  [FILTER_TYPE.FUTURE]: 'There are no future events now',
  [FILTER_TYPE.PRESENT]: 'There are no present events now',
  [FILTER_TYPE.PAST]: 'There are no past events now'
};

const FILTER = {
  [FILTER_TYPE.EVERYTHING]: (points) => points,
  [FILTER_TYPE.FUTURE]: (points) => points.filter((point) => isFutureEvent(point.dateFrom)),
  [FILTER_TYPE.PRESENT]: (points) => points.filter((point) => isPresentEvent(point.dateFrom, point.dateTo)),
  [FILTER_TYPE.PAST]: (points) => points.filter((point) => isPastEvent(point.dateTo))
};

const SORT_TYPE = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price',
};

const MODE = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const METHOD = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

const EVENT_TYPE = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const CITIES = ['Berlin', 'Stuttgart', 'Minsk', 'Köln', 'London', 'Lissabon', 'Irkutsk', 'Sydney', 'Paris', 'Moscow'];

const DESCRIPTIONS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Cras aliquet varius magna, non porta ligula feugiat eget.',
  'Fusce tristique felis at fermentum pharetra.',
  'Aliquam id orci ut lectus varius viverra.',
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.',
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.',
  'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.',
  'Sed sed nisi sed augue convallis suscipit in sed felis.',
  'Aliquam erat volutpat.',
  'Nunc fermentum tortor ac porta dapibus.',
  'In rutrum ac purus sit amet tempus.',
];

const ACTIONS = {
  UPDATE_POINT: 'UPDATE_POINT',
  DELETE_POINT: 'DELETE_POINT',
  ADD_POINT: 'ADD_POINT',
};

const FORM_TYPE = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
};

const POINT = {
  type: 'flight',
  dateFrom: new Date().toISOString(),
  dateTo: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
  destination: null,
  basePrice: 10,
  offers: [],
  isFavorite: false,
  price: 10
};

const UPDATE_TYPE = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
  ERROR: 'ERROR'
};

export {FILTER_TYPE, LIST_MESSAGES, FILTER, SORT_TYPE, MODE, EVENT_TYPE, CITIES, DESCRIPTIONS, ACTIONS, FORM_TYPE, POINT, UPDATE_TYPE, METHOD, AUTHORIZATION, API_URL};
