import { isValid, mustBe } from "./lib.js";
import { stringify } from "./helpers.js";

// LOGICAL

// TODO RETHINK TO COLLECT ALL ERRORS IF POSIBLE
export const not = (...args) => {
  let v = (val) => !isValid(...args)(val);
  v.displayName = `not(${args.map(stringify)})`;
  return v;
};
export const or = (...args) => {
  let v = args;
  v.displayName = `or(${args.map(stringify)})`;
  return v;
};
export const and = (...args) => {
  let v = isValid(...args);
  v.displayName = `and(${args.map(stringify)})`;
  return v;
};

// NUMBERS
export const gt = (limit) => {
  let v = (value) => value > limit;
  v.displayName = `gt(${limit})`;
  return v;
};
export const ge = (limit) => {
  let v = (value) => value >= limit;
  v.displayName = `ge(${limit})`;
  return v;
};

export const lt = (limit) => {
  let v = (value) => value < limit;
  v.displayName = `lt(${limit})`;
  return v;
};
export const le = (limit) => {
  let v = (value) => value <= limit;
  v.displayName = `le(${limit})`;
  return v;
};

export const between = (min, max) => {
  const v = and(ge(min), le(max));
  v.displayName = `between(${min},${max})`;
  return v;
};

export const Integer = and(Number, Number.isInteger);
Integer.displayName = "Integer";

export const Numeric = and(
  [Number, String, BigInt],
  (num) => num == Number(num)
);
Numeric.displayName = "Numeric";

export const hasDecimals = and(
  Numeric,
  (num) => num != Number.parseInt(String(num))
);
hasDecimals.displayName = "hasDecimals";

export const Odd = (num) => Math.abs(Number(num) % 2) === 1;
Odd.displayName = "Odd";

export const Even = (num) => Math.abs(Number(num) % 2) === 0;
Even.displayName = "Even";

export const Finite = and(Numeric, (num) => Number.isFinite(Number(num)));
Finite.displayName = "Finite";

export const Positive = and(Numeric, gt(0));
Positive.displayName = "Positive";

export const Negative = and(Numeric, lt(0));
Negative.displayName = "Negative";

export const SafeInteger = Number.isSafeInteger;
SafeInteger.displayName = "SafeInteger";

export const SafeNumber = and(
  Numeric,
  between(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
);
SafeNumber.displayName = "SafeNumber";

export const min = ge;
min.displayName = "min";

export const max = le;
max.displayName = "max";

// STRINGS
export const contains = (query) => {
  let v = new RegExp(query);
  v.displayName = `contains(${query})`;
  return v;
};
export const startsWith = (query) => {
  let v = (value) => value.search(query) === 0;
  v.displayName = `startsWith(${query})`;
  return v;
};

export const endsWith = (query) => {
  let v = (value) => value.search(query) === value.length - query.length;
  v.displayName = `endsWith(${query})`;
  return v;
};
export const Lowercase = /^(([a-z\W\d]))+$/;
Lowercase.displayName = "Lowercase";

export const Uppercase = /^(([A-Z\W\d]))+$/;
Uppercase.displayName = "Uppercase";

// TODO INSENSITIVEACCENTS

// EXPORT CONST INSENSITIVEACCENTS = NULL;
export const insensitiveCase = (query) => {
  let v = new RegExp(query, "i");
  v.displayName = `insensitiveCase(${query})`;
  return v;
};

// DATES
function isValidDate(date) {
  isValidDate.displayName = `isValidDate(${stringify(date)})`;
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date instanceof Date && !Number.isNaN(Date.parse(date));
}
export const DateString = mustBe(String, isValidDate);
DateString.displayName = "DateString";

export const DateValid = mustBe(Date, isValidDate);
DateValid.displayName = "DateValid";

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
asNumber.displayName = "asNumber";

export const asString = mustBe(
  [BigInt, Number, String, Boolean, Date],
  mustBe(String).or(String)
);
asString.displayName = "asString";

export const asDate = mustBe(
  [DateValid, DateString],
  mustBe(Date).or((str) => new Date(str))
);
asDate.displayName = "asDate";

export const asDateString = mustBe(
  [DateValid, DateString],
  mustBe(DateString).or(String)
);
asDateString.displayName = "asDateString";
