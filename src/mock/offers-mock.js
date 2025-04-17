import {getRandomArrayElement, getRandomElementsOfArray, getOffersByType} from '../utils';

const OFFERS = [
  {
    'type': 'taxi',
    'offers': [
      {
        'id': 1,
        'title': 'Add Luggage',
        'price': 40,
      },
      {
        'id': 2,
        'title': 'Order Uber',
        'price': 20,
      },
      {
        'id': 3,
        'title': 'Select Luxury Car',
        'price': 60,
      },
      {
        'id': 4,
        'title': 'Request Child Seat',
        'price': 15,
      },
      {
        'id': 5,
        'title': 'Priority Pickup',
        'price': 25,
      }
    ]
  },
  {
    'type': 'flight',
    'offers': [
      {
        'id': 1,
        'title': 'Add Veg Meal',
        'price': 50,
      },
      {
        'id': 2,
        'title': 'Extra Legroom Seat',
        'price': 70,
      },
      {
        'id': 3,
        'title': 'Fast Track Security',
        'price': 30,
      },
      {
        'id': 4,
        'title': 'Priority Boarding',
        'price': 40,
      },
      {
        'id': 5,
        'title': 'Additional Baggage',
        'price': 80,
      }
    ]
  },
  {
    'type': 'check-in',
    'offers': [
      {
        'id': 1,
        'title': 'Early Check-In',
        'price': 50,
      },
      {
        'id': 2,
        'title': 'Late Check-Out',
        'price': 60,
      },
      {
        'id': 3,
        'title': 'Room Upgrade',
        'price': 100,
      },
      {
        'id': 4,
        'title': 'Welcome Drink',
        'price': 20,
      },
      {
        'id': 5,
        'title': 'City View Room',
        'price': 40,
      }
    ]
  },
  {
    'type': 'restaurant',
    'offers': [
      {
        'id': 1,
        'title': 'Wine Pairing',
        'price': 45,
      },
      {
        'id': 2,
        'title': 'Dessert Upgrade',
        'price': 25,
      },
      {
        'id': 3,
        'title': 'VIP Table',
        'price': 80,
      }
    ]
  }
];

const OFFERS_MAX_NUMBER = 2;
const OFFERS_MIN_NUMBER = 0;

const getRandomOffersIDs = (eventType) => {
  const offers = getOffersByType(eventType, OFFERS); // Now returns [] if no match

  if (!offers || !offers.length) { // Extra safety check
    return [];
  }

  const offerIDs = offers.map((offer) => offer.id);
  const maxPossibleOffers = Math.min(OFFERS_MAX_NUMBER, offerIDs.length);

  return getRandomElementsOfArray(
    offerIDs,
    getRandomArrayElement(OFFERS_MIN_NUMBER, maxPossibleOffers)
  );
};

export { getRandomOffersIDs, OFFERS };
