import { hasErrors,isValidOrThrow } from "garn-validator";
import { stringify } from "../src/utils.js";

const isNumber = isValidOrThrow((num) => num === Number(num));

let errors = hasErrors({ o: { deep: console.log } })({ o: { deep: 'a1' } })
console.log( errors.map(e => (e.raw)));
