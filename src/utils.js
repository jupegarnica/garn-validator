import { isValid, mustBe } from "./lib.js";

// LOGICAL

// TODO RETHINK TO COLLECT ALL ERRORS IF POSIBLE
export const not = (...args) => (val) => !isValid(...args)(val);
export const or = (...args) => args;
export const and = (...args) => isValid(...args);

// NUMBERS
export const gt = (limit) => (value) => value > limit;
export const ge = (limit) => (value) => value >= limit;

export const lt = (limit) => (value) => value < limit;
export const le = (limit) => (value) => value <= limit;

export const between = (min, max) => and(ge(min), le(max));

export const Integer = and(Number, Number.isInteger);

export const Numeric = and(
  [Number, String, BigInt],
  (num) => num == Number(num)
);
export const hasDecimals = and(
  Numeric,
  (num) => num != Number.parseInt(String(num))
);

export const Odd = (num) => Math.abs(Number(num) % 2) === 1;
export const Even = (num) => Math.abs(Number(num) % 2) === 0;

export const Finite = and(Numeric, (num) => Number.isFinite(Number(num)));

export const Positive = and(Numeric, gt(0));
export const Negative = and(Numeric, lt(0));

export const SafeInteger = Number.isSafeInteger;
export const SafeNumber = and(
  Numeric,
  between(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
);

export const min = ge;
export const max = le;

// STRINGS
export const contains = (query) => new RegExp(query);
export const startsWith = (query) => (value) => value.search(query) === 0;

export const endsWith = (query) => (value) =>
  value.search(query) === value.length - query.length;
export const Lowercase = /^(([a-z\W\d]))+$/;
export const Uppercase = /^(([A-Z\W\d]))+$/;

// TODO INSENSITIVEACCENTS

// EXPORT CONST INSENSITIVEACCENTS = NULL;
export const insensitiveCase = (str) => new RegExp(str, "i");

// DATES
function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(Date.parse(d));
}
export const DateString = mustBe(String, (string) =>
  isValidDate(new Date(string))
);

export const DateValid = mustBe(Date, isValidDate);

export const after = (min) => (date) => new Date(date) > new Date(min);
export const before = (max) => (date) => new Date(date) < new Date(max);

// OBJECTS
export const arrayOf = (type) => isValid(Array, { [/^\d$/]: type });
export const objectOf = (type) => isValid(Object, { [/./]: type });

export const noExtraKeys = (schema) => ({ ...schema, [/./]: () => false });

// CASTING
const castToNumberIfPosible = (maybeNumber, error) => {
  let number = Number(maybeNumber);
  if (number == maybeNumber) return number;
  else throw error;
};

export const asNumber = mustBe(
  Numeric,
  mustBe(Number).or(castToNumberIfPosible)
);

export const asString = mustBe(
  [BigInt, Number, String, Boolean, Date],
  mustBe(String).or(String)
);

export const asDate = mustBe(
  [DateValid, DateString],
  mustBe(Date).or((str) => new Date(str))
);
export const asDateString = mustBe(
  [DateValid, DateString],
  mustBe(DateString).or(String)
);
