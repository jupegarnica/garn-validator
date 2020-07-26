import { hasErrors } from "garn-validator";

// debugger;
// isValid(Number, Boolean)(33);
let errors = hasErrors({ obj: { num: Number, str: String } })({ obj: { num: "2", str: 1 } })

console.log(errors.map(e => e.message));
