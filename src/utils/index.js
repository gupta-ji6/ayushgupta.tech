import { sample } from 'lodash';

export const throttle = (func, wait = 100) => {
  let timer = null;
  return function (...args) {
    if (timer === null) {
      timer = setTimeout(() => {
        func.apply(this, args);
        timer = null;
      }, wait);
    }
  };
};

export const KEY_CODES = {
  ARROW_LEFT: 'ArrowLeft',
  ARROW_LEFT_IE11: 'Left',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_RIGHT_IE11: 'Right',
  ESCAPE: 'Escape',
  ESCAPE_IE11: 'Esc',
  TAB: 'Tab',
  SPACE: ' ',
  SPACE_IE11: 'Spacebar',
  ENTER: 'Enter',
};

export const formatDateTime = date => {
  const formatOptions = {
    // weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  };
  return new Intl.DateTimeFormat('en-US', formatOptions).format(new Date(date));
};

// in miliseconds
const units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

// ref - https://stackoverflow.com/a/53800501/8334159
export const getRelativeTime = (d1, d2 = new Date()) => {
  const elapsed = d1 - d2;

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const u in units) {
    if (Math.abs(elapsed) > units[u] || u === 'second') {
      return rtf.format(Math.round(elapsed / units[u]), u);
    }
  }
};

/**
 * Get a random item from list, with no chances of getting the current item again.
 * Useful only for small lists where chances of getting same item again from normal sampling is high.
 *
 * @returns a random list item which is never same as the current item
 */
export const getRandomItemFromList = ({ list = [], currentItem = undefined }) => {
  // set intitial state
  if (currentItem === undefined) {
    return sample(list);
  }

  const currentItemIndex = list.indexOf(currentItem);

  if (currentItemIndex > -1) {
    list = list.filter(fact => fact !== currentItem);
  }

  return sample(list);
};
