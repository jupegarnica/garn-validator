import {
  hasErrors,
  isValidOrThrow,
  isValid,
  isValidOrThrowAll,
  isValidOrLog,
  isValidOrLogAll,
  TypeValidationError,
  Integer,
  // Numeric,
  SafeNumber,
  mustBe,
  Positive,
  and
} from "garn-validator";

export const Numeric = and(
  [Number, String, BigInt],
  (num) => num == Number(num),
);
// const asNumber = mustBe(isPositive).or(0);

const isPositive = and(Numeric, num => num > 0);
try {
  console.log(mustBe(isPositive)(-1));
} catch (error) {
  console.log(error.message);
}
