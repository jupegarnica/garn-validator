import { isValid, mustBe } from "./lib.js";
import { stringify } from "./helpers.js";

const addDisplayName = (fn) => (...args) => {
  let r = fn(...args);
  r.displayName = `${fn.name.replace('_','')}(${args.map(stringify)})`;
  return r;
};

// LOGICAL

// TODO RETHINK TO COLLECT ALL ERRORS IF POSIBLE

const _not = (...args) => (val) => !isValid(...args)(val);
export const not = addDisplayName(_not)
const _or = (...args) => args;
export const or = addDisplayName(_or)
const _and = (...args) => isValid(...args);
export const and = addDisplayName(_and)
// NUMBERS

const _gt = (limit) => (value) => value > limit;
export const gt = addDisplayName(_gt)
const _ge = (limit) => (value) => value >= limit;
export const ge = addDisplayName(_ge)

const _lt = (limit) => (value) => value < limit;
export const lt = addDisplayName(_lt)
const _le = (limit) => (value) => value <= limit;
export const le = addDisplayName(_le)

const _between = (min, max) => and(ge(min), le(max));
export const between = addDisplayName(_between)
export const Integer = and(Number, Number.isInteger);

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
export const contains = addDisplayName(_contains)
const _startsWith = (query) => (value) => value.search(query) === 0;
export const startsWith = addDisplayName(_startsWith)

const _endsWith = (query) => (value) => value.search(query) === value.length - query.length;
export const endsWith = addDisplayName(_endsWith)
export const Lowercase = /^(([a-z\W\d]))+$/;
Lowercase.displayName = "Lowercase";
export const Uppercase = /^(([A-Z\W\d]))+$/;
Uppercase.displayName = "Uppercase";


// TODO INSENSITIVEACCENTS

// EXPORT CONST INSENSITIVEACCENTS = NULL;

const _insensitiveCase = (str) => new RegExp(str, "i");
export const insensitiveCase = addDisplayName(_insensitiveCase)
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
export const after = addDisplayName(_after)
const _before = (max) => (date) => new Date(date) < new Date(max);
export const before = addDisplayName(_before)
// OBJECTS

const _arrayOf = (type) => isValid(Array, { [/^\d$/]: type });
export const arrayOf = addDisplayName(_arrayOf)
const _objectOf = (type) => isValid(Object, { [/./]: type });
export const objectOf = addDisplayName(_objectOf)

export const noExtraKeys = (schema) => ({ ...schema, [/./]: () => false });
noExtraKeys.displayName = "noExtraKeys";

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

// // LOGICAL

// // TODO RETHINK TO COLLECT ALL ERRORS IF POSIBLE
// const _not = (...args) => {
//   let v = (val) => !isValid(...args)(val);
//   v.displayName = `not(${args.map(stringify)})`;
//   return v;
// };

// const _or = (...args) => {
//   let v = args;
//   v.displayName = `or(${args.map(stringify)})`;
//   return v;
// };
// const _and = (...args) => {
//   let v = isValid(...args);
//   v.displayName = `and(${args.map(stringify)})`;
//   return v;
// };

// // NUMBERS
// const _gt = (limit) => {
//   let v = (value) => value > limit;
//   v.displayName = `gt(${stringify(limit)})`;
//   return v;
// };
// const _ge = (limit) => {
//   let v = (value) => value >= limit;
//   v.displayName = `ge(${stringify(limit)})`;
//   return v;
// };

// const _lt = (limit) => {
//   let v = (value) => value < limit;
//   v.displayName = `lt(${stringify(limit)})`;
//   return v;
// };
// const _le = (limit) => {
//   let v = (value) => value <= limit;
//   v.displayName = `le(${stringify(limit)})`;
//   return v;
// };

// const _between = (min, max) => {
//   const v = and(ge(min), le(max));
//   v.displayName = `between(${min},${max})`;
//   return v;
// };

// export const Integer = and(Number, Number.isInteger);
// Integer.displayName = "Integer";

// export const Numeric = and(
//   [Number, String, BigInt],
//   (num) => num == Number(num)
// );
// Numeric.displayName = "Numeric";

// export const hasDecimals = and(
//   Numeric,
//   (num) => num != Number.parseInt(String(num))
// );
// hasDecimals.displayName = "hasDecimals";

// const _Odd = (num) => Math.abs(Number(num) % 2) === 1;
// Odd.displayName = "Odd";

// const _Even = (num) => Math.abs(Number(num) % 2) === 0;
// Even.displayName = "Even";

// export const Finite = and(Numeric, (num) => Number.isFinite(Number(num)));
// Finite.displayName = "Finite";

// export const Positive = and(Numeric, gt(0));
// Positive.displayName = "Positive";

// export const Negative = and(Numeric, lt(0));
// Negative.displayName = "Negative";

// export const SafeInteger = Number.isSafeInteger;
// SafeInteger.displayName = "SafeInteger";

// export const SafeNumber = and(
//   Numeric,
//   between(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
// );
// SafeNumber.displayName = "SafeNumber";

// export const min = ge;

// export const max = le;

// // STRINGS
// const _contains = (query) => {
//   let v = new RegExp(query);
//   v.displayName = `contains(${query})`;
//   return v;
// };
// const _startsWith = (query) => {
//   let v = (value) => value.search(query) === 0;
//   v.displayName = `startsWith(${query})`;
//   return v;
// };

// const _endsWith = (query) => {
//   let v = (value) => value.search(query) === value.length - query.length;
//   v.displayName = `endsWith(${query})`;
//   return v;
// };
// export const Lowercase = /^(([a-z\W\d]))+$/;
// Lowercase.displayName = "Lowercase";

// export const Uppercase = /^(([A-Z\W\d]))+$/;
// Uppercase.displayName = "Uppercase";

// // TODO INSENSITIVEACCENTS

// // EXPORT CONST INSENSITIVEACCENTS = NULL;
// const _insensitiveCase = (query) => {
//   let v = new RegExp(query, "i");
//   v.displayName = `insensitiveCase(${query})`;
//   return v;
// };

// // DATES
// function isValidDate(date) {
//   isValidDate.displayName = `isValidDate(${stringify(date)})`;
//   if (!(date instanceof Date)) {
//     date = new Date(date);
//   }
//   return date instanceof Date && !Number.isNaN(Date.parse(date));
// }
// export const DateString = mustBe(String, isValidDate);
// DateString.displayName = "DateString";

// export const DateValid = mustBe(Date, isValidDate);
// DateValid.displayName = "DateValid";

// const _after = (min) => {
//   let v = (date) => new Date(date) > new Date(min);
//   v.displayName = `after(${stringify(min)})`;
//   return v;
// };
// const _before = (max) => {
//   let v = (date) => new Date(date) < new Date(max);
//   v.displayName = `before(${stringify(max)})`;
//   return v;
// };

// // OBJECTS
// const _arrayOf = (type) => {
//   let v = isValid(Array, { [/^\d$/]: type });
//   v.displayName = `arrayOf(${stringify(type)})`;
//   return v;
// };

// export const objectOf = addDisplayName("objectOf", (type) =>
//   isValid(Object, { [/./]: type })
// );

// // const _objectOf = (type) => isValid(Object, { [/./]: type });
// const _noExtraKeys = (schema) => ({ ...schema, [/./]: () => false });

// // CASTING
// const castToNumberIfPosible = (maybeNumber, error) => {
//   let number = Number(maybeNumber);
//   if (number == maybeNumber) return number;
//   else throw error;
// };

// export const asNumber = mustBe(
//   Numeric,
//   mustBe(Number).or(castToNumberIfPosible)
// );
// asNumber.displayName = "asNumber";

// export const asString = mustBe(
//   [BigInt, Number, String, Boolean, Date],
//   mustBe(String).or(String)
// );
// asString.displayName = "asString";

// export const asDate = mustBe(
//   [DateValid, DateString],
//   mustBe(Date).or((str) => new Date(str))
// );
// asDate.displayName = "asDate";

// export const asDateString = mustBe(
//   [DateValid, DateString],
//   mustBe(DateString).or(String)
// );
// asDateString.displayName = "asDateString";
