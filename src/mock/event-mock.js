import { nanoid } from 'nanoid';
import {getRandomArrayElement} from '../utils.js';

const mockEvents = [
  {
    id: 3,
    basePrice: 80,
    dateFrom: new Date('2025-02-18T09:30'),
    dateTo: new Date('2025-02-18T11:30'),
    destination: 3,
    isFavourite: true,
    offers: [1,4],
    type: 'flight',
  },
  {
    id: 2,
    basePrice: 110,
    dateFrom: new Date('2025-02-20T22:30'),
    dateTo: new Date('2025-02-22T03:00'),
    destination: 2,
    isFavourite: false,
    offers: [1],
    type: 'flight',
  },
  {
    id: 2,
    basePrice: 10,
    dateFrom: new Date('2025-02-22T03:00'),
    dateTo: new Date('2025-02-22T04:00'),
    destination: 2,
    isFavourite: true,
    offers: [1,3,5],
    type: 'check-in',
  },
  {
    id: 1,
    basePrice: 35,
    dateFrom: new Date('2025-02-22T18:00'),
    dateTo: new Date('2025-02-22T23:30'),
    destination: 1,
    isFavourite: false,
    offers: [1, 2],
    type: 'taxi',
  },
  {
    id: 1,
    basePrice: 1500,
    dateFrom: new Date('2025-02-23T12:00'),
    dateTo: new Date('2025-02-23T14:30'),
    destination: 1,
    isFavourite: true,
    offers: [3],
    type: 'restaurant',
  },
  {
    id: 4,
    basePrice: 50,
    dateFrom: new Date('2025-02-25T06:00'),
    dateTo: new Date('2025-02-25T12:00'),
    destination: 4,
    isFavourite: true,
    offers: [2,3,5],
    type: 'taxi',
  }
];

function getRandomEvent() {
  return {
    id: nanoid(),
    ...getRandomArrayElement(mockEvents)
  };
}

export {getRandomEvent};
