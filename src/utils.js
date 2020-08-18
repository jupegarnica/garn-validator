import { isValid, mustBe } from "./lib.js";
import { stringify } from "./helpers.js";

const addDisplayName = (fn) => (...args) => {
  let r = fn(...args);
  Object.defineProperty(r, "displayName", {
    value: `${fn.name.replace("_", "")}(${args.map(stringify)})`,
    writable: true,
    enumerable: false,
    configurable: false,
  });

  return r;
};

export const any = () => true;
any.displayName = 'any';

// LOGICAL

const _not = (...args) => (val) => !isValid(...args)(val);
// TODO RETHINK TO COLLECT ALL ERRORS IF POSIBLE
export const not = addDisplayName(_not);
const _or = (...args) => args;
export const or = addDisplayName(_or);
const _and = (...args) => mustBe(...args);
export const and = addDisplayName(_and);

// NUMBERS

const _gt = (limit) => (value) => value > limit;
export const gt = addDisplayName(_gt);
const _ge = (limit) => (value) => value >= limit;
export const ge = addDisplayName(_ge);

const _lt = (limit) => (value) => value < limit;
export const lt = addDisplayName(_lt);
const _le = (limit) => (value) => value <= limit;
export const le = addDisplayName(_le);

const _between = (min, max) => and(ge(min), le(max));
export const between = addDisplayName(_between);

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
export const max = le;

// STRINGS

const _contains = (query) => new RegExp(query);
export const contains = addDisplayName(_contains);
const _startsWith = (query) => (value) => value.search(query) === 0;
export const startsWith = addDisplayName(_startsWith);

const _endsWith = (query) => (value) =>
  value.search(query) === value.length - query.length;
export const endsWith = addDisplayName(_endsWith);
export const Lowercase = /^(([a-z\W\d]))+$/;
Lowercase.displayName = "Lowercase";
export const Uppercase = /^(([A-Z\W\d]))+$/;
Uppercase.displayName = "Uppercase";

// TODO INSENSITIVEACCENTS

const _insensitiveCase = (str) => new RegExp(str, "i");
export const insensitiveCase = addDisplayName(_insensitiveCase);
// DATES
function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(Date.parse(d));
}
export const DateString = mustBe(String, (string) =>
  isValidDate(new Date(string))
);

DateString.displayName = "DateString";

export const DateValid = mustBe(Date, isValidDate);
DateValid.displayName = "DateValid";

const _after = (min) => (date) => new Date(date) > new Date(min);
export const after = addDisplayName(_after);
const _before = (max) => (date) => new Date(date) < new Date(max);
export const before = addDisplayName(_before);
// OBJECTS

const _arrayOf = (type) => isValid(Array, { [/^\d$/]: type });
export const arrayOf = addDisplayName(_arrayOf);
const _objectOf = (type) => isValid(Object, { [/./]: type });
export const objectOf = addDisplayName(_objectOf);

const _noExtraKeys = (schema) => ({ ...schema, [/./]: () => false });
export const noExtraKeys = addDisplayName(_noExtraKeys);

// SIZE
const _size = (number) => (value) => {
  let size;
  if (typeof value === "string" || Array.isArray(value)) {
    size = "length";
  }
  if (value && value.constructor === Set) {
    size = "size";
  }

  return value && value[size] === number;
};

export const size = addDisplayName(_size);

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
