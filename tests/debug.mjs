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
    isValidOrLogAll({a:DateString, b:Negative, c:Numeric})({a:"2020-13-32",b:2})

  );


} catch (error) {
  console.log(error);
}
