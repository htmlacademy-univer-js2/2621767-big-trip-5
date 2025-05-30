import { isFutureEvent, isPastEvent, isPresentEvent } from './date-utils.js';

const AUTHORIZATION = 'Basic vikaapi1234567';
const API_URL = 'https://24.objects.htmlacademy.pro/big-trip';

const METHOD_TYPE = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

const FILTER_TYPE = {
  EVERYTHING: 'EVERYTHING',
  FUTURE: 'FUTURE',
  PRESENT: 'PRESENT',
  PAST: 'PAST',
};


const LIST_MESSAGE = {
  [FILTER_TYPE.EVERYTHING]: 'Click New Event to create your first point',
  [FILTER_TYPE.FUTURE]: 'There are no future events now',
  [FILTER_TYPE.PRESENT]: 'There are no present events now',
  [FILTER_TYPE.PAST]: 'There are no past events now',
};

const FILTER = {
  [FILTER_TYPE.EVERYTHING]: (points) => points,
  [FILTER_TYPE.FUTURE]: (points) => points.filter((point) => isFutureEvent(point.dateFrom)),
  [FILTER_TYPE.PRESENT]: (points) => points.filter((point) => isPresentEvent(point.dateFrom, point.dateTo)),
  [FILTER_TYPE.PAST]: (points) => points.filter((point) => isPastEvent(point.dateTo)),
};

const SORT_TYPE = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price',
};

const MODE_TYPE = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const EVENT_TYPE = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];


const ACTION_TYPE = {
  UPDATE_POINT: 'UPDATE_POINT',
  DELETE_POINT: 'DELETE_POINT',
  ADD_POINT: 'ADD_POINT',
};

const FORM_TYPE = {
  CREATE: 'CREATE',
  EDIT: 'EDIT',
};

const BLANK_POINT = {
  type: 'flight',
  dateFrom: '',
  dateTo: '',
  destination: null,
  basePrice: 0,
  offers: [],
  isFavorite: false,
  price: 0
};

const UPDATE_TYPE = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
  ERROR: 'ERROR',
};

export {
  AUTHORIZATION,
  API_URL,
  METHOD_TYPE,
  FILTER_TYPE,
  LIST_MESSAGE,
  FILTER,
  SORT_TYPE,
  MODE_TYPE,
  EVENT_TYPE,
  ACTION_TYPE,
  FORM_TYPE,
  BLANK_POINT,
  UPDATE_TYPE
};
