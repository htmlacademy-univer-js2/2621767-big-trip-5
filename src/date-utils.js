import dayjs from 'dayjs';

export const isPastEvent = (date) => dayjs(date).isBefore(dayjs());
export const isPresentEvent = (dateFrom, dateTo) => dayjs(dateFrom).isBefore(dayjs()) && dayjs(dateTo).isAfter(dayjs());
export const isFutureEvent = (date) => dayjs(date).isAfter(dayjs());
