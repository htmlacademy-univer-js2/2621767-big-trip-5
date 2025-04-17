import { EVENT_TYPES } from '../const.js';
import { getRandomArrayElement, getRandomElementsOfArray, getRandomDates } from '../utils.js';
import { getRandomOffersIDs } from './offers-mock';
import { getRandomDestination } from './destination-mock';

const MIN_COST = 2000;
const MAX_COST = 5000;
const POINTS_MAX_COUNT = 9;

const getRandomEvent = () => {
  const twoDates = getRandomDates();
  const eventType = EVENT_TYPES[getRandomArrayElement(0, EVENT_TYPES.length - 1)];
  const destination = getRandomDestination();

  // Проверяем, что destination существует и имеет id
  const destinationId = destination?.id || crypto.randomUUID();

  // Гарантируем, что basePrice будет числом
  const basePrice = getRandomArrayElement(MIN_COST, MAX_COST) || MIN_COST;

  return {
    id: crypto.randomUUID(),
    basePrice: basePrice,
    dateFrom: twoDates[0],
    dateTo: twoDates[1],
    destination: destinationId,
    isFavorite: Boolean(getRandomArrayElement(0, 1)),
    offers: getRandomOffersIDs(eventType),
    type: eventType
  };
};

const POINTS = Array.from({length: POINTS_MAX_COUNT}, getRandomEvent);

export {POINTS};
