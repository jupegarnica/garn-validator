import {
  hasErrors,
  isValidOrThrow,
  isValid,
  isValidOrThrowAll,
  isValidOrLog,
  isValidOrLogAll,
} from "garn-validator";
// let validator = isValidOrThrow(Number, String);

//   isValidOrThrowAll({a:validator})({a:null});
let validator = isValidOrThrow(Number, String);

try {
  throw hasErrors({ a: { b: { c: { d: validator, e:validator } } } })({
    a: { b: { c: { d: null } } },
  });
} catch (errors) {
  errors.forEach(error => {
    console.log(error.raw.path)
    console.log(error.message)
    // .toMatch(/\/a\/b\/c\/[de]/);
  })
}
