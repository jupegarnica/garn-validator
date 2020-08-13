import {
  hasErrors,
  isValidOrThrow,
  isValid,
  isValidOrThrowAll,
  isValidOrLog,
  isValidOrLogAll,
  TypeValidationError,
  Integer,
  Numeric,
  SafeNumber,
  mustBe,
} from "garn-validator";

const NumberOrZero = mustBe(Number).or(0);
const isString = hasErrors(String);

// console.log(NumberOrZero(null));
// console.log(mustBe(NumberOrZero)(null));
console.log(mustBe({a:NumberOrZero, b:isString})({a:null}).map(e=>e.message));


// try {
//   const NumericOrZero = mustBe(Number).or( v => v + 2)//.or( v => v + 3)
//   const res = mustBe({ a: NumericOrZero, [/b/]: NumericOrZero, c$:NumericOrZero })({ a: '1', b: null });
//   console.log('res', res);
// } catch (error) {
//   throw error
//   // console.log('error.raw',error.raw);
//   // for (const key in error.raw.conf) {
//   //   const element = error.raw.conf[key];
//   //   console.log(key, stringify(element));
//   // }
// }
