import { hasErrors,isValidOrThrow ,isValid} from "garn-validator";
import { stringify } from "../src/utils.js";
let n = (num) => num === Number(num)
const isNumber = isValidOrThrow(n);

let errors = hasErrors({ o: { deep: isNumber } })({ o: { deep: 'a1' } })
console.log( errors );
