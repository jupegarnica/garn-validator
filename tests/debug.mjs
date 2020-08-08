import {
  hasErrors,
  isValidOrThrow,
  isValid,
  isValidOrThrowAll,
  isValidOrLog,
  isValidOrLogAll,
  TypeValidationError,
} from "garn-validator";
// let validator = isValidOrThrow(Number, String);

//   isValidOrThrowAll({a:validator})({a:null});
// let validator = isValidOrThrow(Number, String);

// try {
//   throw hasErrors({ a: { b: { c: { d: validator, e:validator } } } })({
//     a: { b: { c: { d: null } } },
//   });
// } catch (errors) {
//   errors.forEach(error => {
//     console.log(error.raw.path)
//     console.log(error.message)
//     // .toMatch(/\/a\/b\/c\/[de]/);
//   })
// }
// try {
//   isValidOrThrowAll({a:Number, b: String})({a:null, b:null});

// } catch (error) {
//   error instanceof TypeValidationError; // true
//   console.log(  error
//     );
// }
// try {
//   isValidOrThrow({ a: Number})({ a: null });
// } catch (error) {
//   console.log(error.raw);

// }

console.log(
  hasErrors({a:Number, b:String})({a:null, b:null})

);
