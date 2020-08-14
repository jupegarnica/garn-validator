import { isValid } from "./lib.js";

export const arrayOf = (type) => isValid(Array, { [/^\d$/]: type });
export const objectOf = (type) => isValid(Object, { [/./]: type });

// LOGICAL

// TODO Rethink to collect all errors if posible
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
  (num) => num == Number(num),
);
export const hasDecimals = and(
  Numeric,
  (num) => num != Number.parseInt(String(num)),
);

export const Odd = (num) => Math.abs(Number(num) % 2) === 1;
export const Even = (num) => Math.abs(Number(num) % 2) === 0;

export const Finite = and(Numeric, (num) => Number.isFinite(Number(num)));

export const Positive = and(Numeric, gt(0));
export const Negative = and(Numeric, lt(0));

export const SafeInteger = Number.isSafeInteger;
export const SafeNumber = and(
  Numeric,
  between(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
);

export const min = ge;
export const max = le;

export const contains = (query) => new RegExp(query);
export const startsWith = (query) => (value) => value.search(query) === 0;

export const endsWith = (query) =>
  (value) => value.search(query) === value.length - query.length;
export const Lowercase = /^(([a-z\W\d]))+$/;
export const Uppercase = /^(([A-Z\W\d]))+$/;

// TODO insensitiveAccents
// export const insensitiveAccents = null;
export const insensitiveCase = (str) => new RegExp(str, "i");

// TODO isDate
