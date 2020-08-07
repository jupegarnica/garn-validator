import { hasErrors,isValidOrThrow ,isValid, isValidOrThrowAll} from "garn-validator";
import { stringify } from "../src/utils.js";
let n = (num) => num === Number(num)

const isNumber = hasErrors([n]);

try {

// console.log(
//   hasErrors({ o: { deep: isNumber } },'hola?')({ o: { deep: 'a1' } })
// );
let errors = hasErrors({ o: { deep: isNumber } })({ o: { deep: 'a1' } })
errors.forEach(e => console.log(e.raw));
console.log(errors);

} catch (error) {
  // error.errors.forEach(e => console.log(e.raw.conf.onValid.toString()));
  // console.log(error);
}
