import { isFutureEvent, isPastEvent, isPresentEvent } from './utils.js';

const filterType = {
  EVERYTHING:'everything',
  FUTURE:'future',
  PRESENT:'present',
  PAST:'past',
};

const filter = {
  [filterType.EVERYTHING]: (points) => points,
  [filterType.FUTURE]: (points) => points.filter((point) => isFutureEvent(point.dateFrom)),
  [filterType.PRESENT]: (points) => points.filter((point) => isPresentEvent(point.dateFrom, point.dateTo)),
  [filterType.PAST]: (points) => points.filter((point) => isPastEvent(point.dateTo))
};

export {filter};
