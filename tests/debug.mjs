import {
  hasErrors,
  isValidOrThrow,
  isValid,
  isValidOrThrowAll,
  isValidOrLog,
  isValidOrLogAll,
  TypeValidationError,
} from "garn-validator";



const isBigNumber = hasErrors(
  [Number, String],
  (num) => num == Number(num),
  num => num > 1000
  );

// let s = Symbol('s')

// let o = {
//   [s]: 'hola',
//   x:1
// }


// let i=1;
// for (const key in o) {
//   const element = o[key];
//   console.log(key,element,i++);
// }
console.log(isBigNumber);

isValid(isBigNumber)(2)
// Object.values(o).forEach(console.log)
// its normal behavior
// isBigNumber('a12').forEach(e => console.log(e.message));
/* [
  new TypeValidationError("value 200 do not match validator (v) => v < 100"),
  new TypeValidationError("value null do not match constructor Number"),
  new TypeValidationError("value null do not match constructor String"),
  new TypeValidationError("value null do not match validator (num) => num == Number(num)"),
];
 */

// inherit behavior
// isValidOrLog(isBigNumber)('a12'); // false, and log only one error value "a12" do not match validator (num) => num == Number(num)
