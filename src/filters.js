import {FILTER_TYPE} from './const';
import {isPastEvent, isPresentEvent, isFutureEvent} from './date-utils';

export const getAvailableFilters = (points) => {
  new Date();
  return [
    {
      id: FILTER_TYPE.EVERYTHING,
      name: 'Everything',
      isDisabled: points.length === 0
    },
    {
      id: FILTER_TYPE.FUTURE,
      name: 'Future',
      isDisabled: points.every((point) => !isFutureEvent(point.dateFrom))
    },
    {
      id: FILTER_TYPE.PRESENT,
      name: 'Present',
      isDisabled: points.every((point) => !isPresentEvent(point.dateFrom, point.dateTo))
    },
    {
      id: FILTER_TYPE.PAST,
      name: 'Past',
      isDisabled: points.every((point) => !isPastEvent(point.dateTo))
    }
  ];
};
