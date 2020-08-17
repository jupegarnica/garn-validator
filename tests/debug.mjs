import {
  hasErrors,
  isValid,
  isValidOrLog,
  isValidOrLogAll,
  TypeValidationError,
  Integer,
  Numeric,
  Negative,
  SafeNumber,
  mustBe,
  Positive,
  and,
  DateString,
  mustBeOrThrowAll,
} from "garn-validator";

try {

  console.log(
    isValidOrLogAll({a:1, c:mustBe(Number).or(0)})({a:0})

  );


} catch (error) {
  console.log(error);
}
