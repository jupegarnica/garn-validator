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

console.log('memoryUsage',process.memoryUsage().heapUsed);

for (let index = 0; index < 1000; index++) {
  const NumericOrZero = mustBe(Number).or(0);
  let res  = mustBe({ a: NumericOrZero, [/b/]: NumericOrZero, c$:NumericOrZero })({ a: 'null', b: null });
  res = null;
}

console.log('memoryUsage',process.memoryUsage().heapUsed);
