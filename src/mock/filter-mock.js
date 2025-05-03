import { FILTER } from '../const.js';

function generateFilter(points) {
  return Object.entries(FILTER).map(([filterType, filterPoints]) => ({
    name: filterType,
    count: filterPoints(points).length
  }));
}

export { generateFilter };
