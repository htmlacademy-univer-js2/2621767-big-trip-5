import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { FILTER_TYPE } from './const.js';

dayjs.extend(duration);


const DATE_FORMAT = 'MMM D';
const FORM_DATE_FORMAT = 'DD/MM/YY HH:mm';
const TIME_FORMAT = 'HH:mm';


function formatEventTime(date) {
  return date ? dayjs(date).format(TIME_FORMAT) : '';
}

function formatEventDate(date) {
  return date ? dayjs(date).format(DATE_FORMAT) : '';
}

function getFullDate(date) {
  return date ? dayjs(date).format(FORM_DATE_FORMAT) : '';
}

function formatEventDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return '';
  }

  const diffInMs = dayjs(endDate).diff(dayjs(startDate));
  const durationObject = dayjs.duration(diffInMs);

  const days = Math.floor(durationObject.asDays());
  const hours = durationObject.hours();
  const minutes = durationObject.minutes();

  let result = '';

  if (days > 0) {
    result += `${String(days).padStart(2, '0')}D `;
  }

  if (hours > 0 || days > 0) {
    result += `${String(hours).padStart(2, '0')}H `;
  }

  result += `${String(minutes).padStart(2, '0')}M`;

  return result.trim();
}

function getOffersByType(type, offersByType) {
  return offersByType[type] || [];
}

const isEscapeKey = (evt) => evt.key === 'Escape';

const isPastEvent = (dateTo) => dayjs(dateTo).isBefore(dayjs());

const isPresentEvent = (dateFrom, dateTo) => dayjs(dateFrom).isBefore(dayjs()) && dayjs(dateTo).isAfter(dayjs());

const isFutureEvent = (dateFrom) => dayjs(dateFrom).isAfter(dayjs());


function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

const sortByDay = (pointA, pointB) => dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));

const sortByTime = (pointA, pointB) => {
  const durationA = dayjs(pointA.dateTo).diff(pointA.dateFrom);
  const durationB = dayjs(pointB.dateTo).diff(pointB.dateFrom);
  return durationB - durationA;
};

const sortByPrice = (pointA, pointB) => pointB.price - pointA.price;

const filterPoints = {
  [FILTER_TYPE.EVERYTHING]: (points) => points,
  [FILTER_TYPE.FUTURE]: (points) => points.filter((point) => isFutureEvent(point.dateFrom)),
  [FILTER_TYPE.PRESENT]: (points) => points.filter((point) => isPresentEvent(point.dateFrom, point.dateTo)),
  [FILTER_TYPE.PAST]: (points) => points.filter((point) => isPastEvent(point.dateTo))
};


export {
  formatEventDate,
  formatEventTime,
  getFullDate,
  formatEventDuration,
  getOffersByType,
  isEscapeKey,
  isFutureEvent,
  isPastEvent,
  isPresentEvent,
  updateItem,
  sortByDay,
  sortByTime,
  sortByPrice,
  filterPoints
};
