type RelativeTimeUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

// in milliseconds, largest → smallest
const units: [RelativeTimeUnit, number][] = [
  ['year', 24 * 60 * 60 * 1000 * 365],
  ['month', (24 * 60 * 60 * 1000 * 365) / 12],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

// ref - https://stackoverflow.com/a/53800501/8334159
export const getRelativeTime = (
  d1: number,
  d2: number = Date.now(),
): string => {
  const elapsed = d1 - d2;

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const [unit, ms] of units) {
    if (Math.abs(elapsed) > ms || unit === 'second') {
      return rtf.format(Math.round(elapsed / ms), unit);
    }
  }

  return rtf.format(0, 'second');
};
