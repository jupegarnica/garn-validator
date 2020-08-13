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

try {
  const NumericOrZero = mustBe(Number).or( v => v + 2)//.or( v => v + 3)
  const res = mustBe({ a: NumericOrZero, [/b/]: NumericOrZero, c$:NumericOrZero })({ a: '1', b: null });
  console.log('res', res);
} catch (error) {
  throw error
  // console.log('error.raw',error.raw);
  // for (const key in error.raw.conf) {
  //   const element = error.raw.conf[key];
  //   console.log(key, stringify(element));
  // }
}
