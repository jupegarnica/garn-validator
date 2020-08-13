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

// const  isString= isValidOrLog(String);
// const  isNumeric= hasErrors(Number);
// const  asNumeric= mustBe(Number).or(0);
// const NumberOrZero = isValid(isString);
try {
  let input = "not a valid number";
  let transformToNumberIfPosible = (maybeNumber) => {
    let number = Number(maybeNumber);
    if (number == maybeNumber) return number;
    else throw new TypeError("not valid number");
  };
  let asNumber = mustBe(Number).or(transformToNumberIfPosible);
  let number = asNumber(input);
  console.log(number);
} catch (err) {
  console.log(err);
}
