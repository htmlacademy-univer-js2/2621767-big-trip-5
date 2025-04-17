import {CITIES} from '../const.js';
import {DESCRIPTIONS} from '../const.js';
import {getRandomArrayElement, getRandomElementsOfArray} from '../utils';

const MIN_DESCRIPTION_NUMBER = 1;
const MAX_DESCRIPTION_NUMBER = 5;
const MIN_PHOTO_NUMBER = 1;
const MAX_PHOTO_NUMBER = 5;

const getDestinationByCity = (city) => ({
  id: crypto.randomUUID(),
  description: Array.from(
    {length: getRandomArrayElement(MIN_DESCRIPTION_NUMBER, MAX_DESCRIPTION_NUMBER)},
    () => getRandomElementsOfArray(DESCRIPTIONS)
  ).join(' '),
  city: city,
  pictures: Array.from(
    {length: getRandomArrayElement(MIN_PHOTO_NUMBER, MAX_PHOTO_NUMBER)},
    () => ({
      src: `https://loremflickr.com/248/152?random=${getRandomArrayElement(1, 1000)}`,
      alt: `Picture of the ${city}`,
    })
  ),
});

// Создаём destinations только если CITIES не пустой
const DESTINATIONS = CITIES?.length ? CITIES.map(getDestinationByCity) : [{
  id: crypto.randomUUID(),
  city: 'Default City',
  description: 'Default description',
  pictures: []
}];

const getRandomDestination = () => {
  if (!DESTINATIONS.length) {
    return {
      id: crypto.randomUUID(),
      city: 'Default City',
      description: 'Default description',
      pictures: []
    };
  }
  return DESTINATIONS[getRandomArrayElement(0, DESTINATIONS.length - 1)];
};


export { getRandomDestination, DESTINATIONS};
