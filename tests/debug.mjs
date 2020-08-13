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

const isString = isValidOrLog(String);
const asNumber = mustBe(Number).or(0)
;

try {
  console.log(mustBe(asNumber).or(3)(2));
} catch (error) {
  console.log(error.message);
}
