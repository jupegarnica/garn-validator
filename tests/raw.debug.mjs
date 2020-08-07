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
try {

let validator = isValidOrLogAll(Number, String);
let errors = isValidOrThrowAll({
  a: validator,
  b: {
    c: {
      d: validator,
    },
  },
})({
  a: null,
  b: {
    c: {
      d: null,
    },
  },
});

console.log(errors.map((e) => e.message));

} catch (error) {

  console.log(error);
}
