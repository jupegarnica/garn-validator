import {
  hasErrors,
  isValid,
  isValidOrLog,
  isValidOrLogAll,
  TypeValidationError,
  Integer,
  // Numeric,
  SafeNumber,
  mustBe,
  Positive,
  and,
  DateString
} from "garn-validator";

try {

  console.log(
    mustBe(DateString)("2020-13-32")

  );

} catch (error) {
  console.log(error);
}
