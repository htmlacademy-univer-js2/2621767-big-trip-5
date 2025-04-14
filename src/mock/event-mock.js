import { nanoid } from 'nanoid';
import {getRandomArrayElement} from '../utils.js';

const eventTemplates = [
  {
    basePrice: 80,
    dateFrom: new Date('2025-02-18T09:30'),
    dateTo: new Date('2025-02-18T11:30'),
    destination: 3,
    isFavorite: true,
    offers: [1,4],
    type: 'flight',
  },
  {
    basePrice: 110,
    dateFrom: new Date('2025-02-20T22:30'),
    dateTo: new Date('2025-02-22T03:00'),
    destination: 2,
    isFavorite: false,
    offers: [1],
    type: 'flight',
  },
  {
    basePrice: 10,
    dateFrom: new Date('2025-02-22T03:00'),
    dateTo: new Date('2025-02-22T04:00'),
    destination: 2,
    isFavorite: true,
    offers: [1,3,5],
    type: 'check-in',
  },
  {
    basePrice: 35,
    dateFrom: new Date('2025-02-22T18:00'),
    dateTo: new Date('2025-02-22T23:30'),
    destination: 1,
    isFavorite: false,
    offers: [1, 2],
    type: 'taxi',
  },
  {
    basePrice: 1500,
    dateFrom: new Date('2025-02-23T12:00'),
    dateTo: new Date('2025-02-23T14:30'),
    destination: 1,
    isFavorite: true,
    offers: [3],
    type: 'restaurant',
  },
  {
    basePrice: 50,
    dateFrom: new Date('2025-02-25T06:00'),
    dateTo: new Date('2025-02-25T12:00'),
    destination: 4,
    isFavorite: true,
    offers: [2,3,5],
    type: 'taxi',
  }
];

function getRandomEvent() {
  const template = getRandomArrayElement(eventTemplates);

  return {
    ...template,
    id: nanoid(),
    dateFrom: new Date(template.dateFrom.getTime()),
    dateTo: new Date(template.dateTo.getTime())
  };
}

export {getRandomEvent};
