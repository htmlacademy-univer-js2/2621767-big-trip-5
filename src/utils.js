import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {mockDestinations} from './mock/destination';
import {mockOffers} from './mock/offers';

dayjs.extend(duration);

const DATE_FORMAT = 'MMM D';
const FORM_DATE_FORMAT = 'DD/MM/YY';
const TIME_FORMAT = 'HH:mm';

function getRandomArrayElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatEventTime(date) {
  return date ? dayjs(date).format(TIME_FORMAT) : '';
}

function formatEventDate(date) {
  return date ? dayjs(date).format(DATE_FORMAT) : '';
}

function formatFormEventDate(date) {
  return date ? dayjs(date).format(FORM_DATE_FORMAT) : '';
}

function getDestinationById(event) {
  return mockDestinations.find((destination) => destination.id === event.destinationID);
}

function getOffersByType(event) {
  return mockOffers.find((offer) => offer.type === event.type).offers;
}

function formatEventDuration(startDate, endDate) {
  const eventDuration = dayjs.duration(endDate - startDate);
  const durationInDays = eventDuration.format('DD');
  const durationInHours = eventDuration.format('HH');
  const durationInMinutes = eventDuration.format('mm');

  if (durationInHours === '00') {
    return `${durationInMinutes}M`;
  }

  if (durationInDays === '00') {
    return `${durationInHours}H ${durationInMinutes}M`;
  }

  return `${durationInDays}D ${durationInHours}H ${durationInMinutes}M`;
}

export {
  getRandomArrayElement,
  formatEventDate,
  formatEventTime,
  getDestinationById,
  getOffersByType,
  formatEventDuration,
  formatFormEventDate
};
