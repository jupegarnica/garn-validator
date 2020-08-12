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
  const NumericOrZero = mustBe(Number).or(0);
  // console.log(
  //   NumericOrZero(null)
  // );
  const res = mustBe({ a: NumericOrZero, [/b/]: NumericOrZero, c$:NumericOrZero })({ a: 'null', b: null });
  console.log('res', res);
} catch (error) {
  console.log('error.raw',error.raw);
  // for (const key in error.raw.conf) {
  //   const element = error.raw.conf[key];
  //   console.log(key, stringify(element));
  // }
}
