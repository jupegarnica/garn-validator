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
  DateString,
  cast
} from "garn-validator";

try {

  console.log(
    mustBe(cast(()=>{
      throw 'ups'
    }))("2020-13-32")

  );


} catch (error) {
  console.log(error);
}
