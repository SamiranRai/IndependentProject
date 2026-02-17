const VALID_RANGES = ["day", "week", "month"];

const TIME_RANGES_DAYS = {
  day: 1,
  week: 7,
  month: 30,
};

const DEFAULT_RANGE = "day";

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
};

module.exports = {
  VALID_RANGES,
  TIME_RANGES_DAYS,
  DEFAULT_RANGE,
  PAGINATION,
};
