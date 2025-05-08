import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { FILTER_TYPE } from './const.js';

dayjs.extend(duration);

const DATE_FORMAT = 'MMM D';
const FORM_DATE_FORMAT = 'DD/MM/YY';
const TIME_FORMAT = 'HH:mm';

const getRandomArrayElement = (min, max) => {
  if (min === undefined || max === undefined) {
    throw new Error('Both min and max must be provided');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomElementsOfArray = (array, count) => {
  if (!Array.isArray(array) || array.length === 0) {
    return [];
  }

  const actualCount = count ?? getRandomArrayElement(1, array.length);
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, actualCount);
};

function formatEventTime(date) {
  return date ? dayjs(date).format(TIME_FORMAT) : '';
}

function formatEventDate(date) {
  return date ? dayjs(date).format(DATE_FORMAT) : '';
}

function formatFormEventDate(date) {
  return date ? dayjs(date).format(FORM_DATE_FORMAT) : '';
}

function getDestinationById(event, destinations) {
  return destinations.find((destination) => destination.id === event.destination);
}

function getDestinationByCity(city, destinations) {
  return destinations.find((destination) => destination.city === city);
}

function getOffersByType(type, offersByType) {
  return offersByType[type] || [];
}


function getOffersById(id, offers) {
  return offers.find((offer) => offer.id === id);
}

function formatEventDuration(startDate, endDate) {
  if (!startDate || !endDate) {
    return '';
  }

  const diffInMilliseconds = dayjs(endDate).diff(dayjs(startDate));
  const eventDuration = dayjs.duration(diffInMilliseconds);

  const years = eventDuration.years();
  const months = eventDuration.months();
  const days = eventDuration.days();
  const hours = eventDuration.hours();
  const minutes = eventDuration.minutes();

  let result = '';

  if (years > 0) {
    result += `${years}Y `;
  }

  if (months > 0 || years > 0) {
    result += `${months}M `;
  }

  if (days > 0 || months > 0 || years > 0) {
    result += `${days}D `;
  }

  if (hours > 0 || days > 0 || months > 0 || years > 0) {
    result += `${hours}H `;
  }

  result += `${minutes}M`;

  result = result.replace(/^0[YMDH]\s+/g, '').trim();

  return result;
}

function isEscapeKey(evt) {
  return evt.key === 'Escape';
}

const isPastEvent = (date) => dayjs(date).isBefore(dayjs());

const isPresentEvent = (dateFrom, dateTo) => dayjs(dateFrom).isBefore(dayjs()) && dayjs(dateTo).isAfter(dayjs());

const isFutureEvent = (date) => dayjs(date).isAfter(dayjs());

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

const sortByDay = (pointA, pointB) => dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));

const sortByTime = (pointA, pointB) => dayjs(pointB.dateTo).diff(pointB.dateFrom) - dayjs(pointA.dateTo).diff(pointA.dateFrom);

const sortByPrice = (pointA, pointB) => pointB.price - pointA.price;

const getFullDate = (date) => dayjs(date).format('DD/MM/YY HH:mm');

const isSameDate = (date1, date2) => dayjs(date1).isSame(date2, 'd');

const filter = {
  [FILTER_TYPE.EVERYTHING]: (points) => points,
  [FILTER_TYPE.FUTURE]: (points) => points.filter((point) => isFutureEvent(point.dateFrom)),
  [FILTER_TYPE.PRESENT]: (points) => points.filter((point) => isPresentEvent(point.dateFrom, point.dateTo)),
  [FILTER_TYPE.PAST]: (points) => points.filter((point) => isPastEvent(point.dateTo))
};

const getRandomDates = () => {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() + Math.floor(Math.random() * 11) - 5);
  dateFrom.setHours(Math.floor(Math.random() * 24));
  dateFrom.setMinutes(Math.floor(Math.random() * 12) * 5);
  dateFrom.setSeconds(0);
  dateFrom.setMilliseconds(0);

  const dateTo = new Date(dateFrom);
  const durationInMs = Math.floor(
    Math.random() * (5 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000) + 30 * 60 * 1000
  );
  dateTo.setTime(dateFrom.getTime() + durationInMs);

  return [dateFrom, dateTo];
};

export {
  getRandomArrayElement,
  getRandomElementsOfArray,
  formatEventDate,
  formatEventTime,
  getDestinationById,
  getOffersByType,
  getOffersById,
  getDestinationByCity,
  formatEventDuration,
  formatFormEventDate,
  isEscapeKey,
  isFutureEvent,
  isPastEvent,
  isPresentEvent,
  updateItem,
  sortByDay,
  sortByTime,
  sortByPrice,
  isSameDate,
  filter,
  getRandomDates,
  getFullDate
};
