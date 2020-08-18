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
  noExtraKeys,
  size
} from "garn-validator";

try {
  // console.log(
  //   isValidOrLogAll(noExtraKeys({a:1, c:mustBe(Number).or(0)}))({a:0})

  // );
  const set = new Set([0]);
  console.log(mustBe(size(1))(set));
} catch (error) {
  console.log(error);
}
