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

const color = /#(?:[a-f\d]{3}){1,2}\b|rgb\((?:(?:\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,){2}\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)|\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%(?:\s*,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%){2})\s*\)|hsl\(\s*0*(?:360|3[0-5]\d|[12]?\d?\d)\s*(?:,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*){2}\)|(?:rgba\((?:(?:\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,){3}|(?:\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*,){3})|hsla\(\s*0*(?:360|3[0-5]\d|[12]?\d?\d)\s*(?:,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%\s*){2},)\s*0*(?:1|0(?:\.\d+)?)\s*\)/ig
const regexp = /ee/i

try {


  let res = mustBeOrThrowAll({
    // [/[0-9]/]:String,
    [color]:String,
  })({
    '#ff22aa': 2,
    '#ffEEaa': 2,
    // '#ff22zz': 2,
  });
  // var matches = new RegExp('hola \S+').exec('Esto es un hola mundo!');
  // console.log(matches[1]);

  console.log(res);
} catch (error) {
  console.log(error);
}
