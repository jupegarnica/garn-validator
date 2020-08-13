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

const  isString= isValidOrLog(String);
const  isNumeric= hasErrors(Number);
const  asNumeric= mustBe(Number).or(0);
// const NumberOrZero = isValid(isString);
try {
  isValidOrLogAll(asNumeric, isNumeric)({a:null})
} catch (error) {
  console.log(error.message);
}
