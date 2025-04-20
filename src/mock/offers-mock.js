import {getRandomArrayElement, getRandomElementsOfArray} from '../utils';

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
      },
      {
        'id': 4,
        'title': 'Priority Seating',
        'price': 20,
      },
      {
        'id': 5,
        'title': 'Romantic Table',
        'price': 80,
      }
    ]
  },
  {
    'type': 'ship',
    'offers': [
      {
        'id': 1,
        'title': 'Add luggage',
        'price': 15,
      },
      {
        'id': 2,
        'title': 'Add breakfast',
        'price': 35,
      },
      {
        'id': 3,
        'title': 'Wi-fi',
        'price': 10,
      },
      {
        'id': 4,
        'title': 'Priority Seating',
        'price': 20,
      },
      {
        'id': 5,
        'title': 'Window Seat',
        'price': 40,
      }
    ]
  },
  {
    'type': 'sightseeing',
    'offers': [
      {
        'id': 1,
        'title': 'Translater',
        'price': 25,
      },
      {
        'id': 2,
        'title': 'Eiffel Tower',
        'price': 55,
      },
      {
        'id': 3,
        'title': 'City tour',
        'price': 80,
      },
      {
        'id': 4,
        'title': 'Hermitage',
        'price': 40,
      },
      {
        'id': 5,
        'title': 'Take a guide',
        'price': 30,
      }
    ]
  },
  {
    'type': 'train',
    'offers': [
      {
        'id': 1,
        'title': 'Choose coupe ticket',
        'price': 45,
      },
      {
        'id': 2,
        'title': 'Add luggage',
        'price': 25,
      },
      {
        'id': 3,
        'title': 'VIP',
        'price': 80,
      },
      {
        'id': 4,
        'title': 'Add breakfast',
        'price': 15,
      },
      {
        'id': 5,
        'title': 'Get insurance',
        'price': 80,
      }
    ]
  },
  {
    'type': 'drive',
    'offers': [
      {
        'id': 1,
        'title': 'Petrol',
        'price': 45,
      },
      {
        'id': 2,
        'title': 'Breakdown',
        'price': 125,
      },
      {
        'id': 3,
        'title': 'Other',
        'price': 20,
      }
    ]
  },
  {
    'type': 'bus',
    'offers': [
      {
        'id': 1,
        'title': 'Add luggage',
        'price': 45,
      },
      {
        'id': 2,
        'title': 'Place near window',
        'price': 25,
      },
      {
        'id': 3,
        'title': 'Choose single seat',
        'price': 80,
      }
    ]
  }
];

const OFFERS_MAX_NUMBER = 2;
const OFFERS_MIN_NUMBER = 0;

const getRandomOffersIDs = (eventType) => {
  const offersGroup = OFFERS.find((group) => group.type === eventType);

  return getRandomElementsOfArray(
    offersGroup.offers.map((offer) => offer.id),
    getRandomArrayElement(OFFERS_MIN_NUMBER, OFFERS_MAX_NUMBER)
  );
};

export { getRandomOffersIDs, OFFERS };
