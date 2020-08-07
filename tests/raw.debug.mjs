import { hasErrors,isValidOrThrow ,isValid, isValidOrThrowAll} from "garn-validator";
let validator = isValidOrThrow(Number, String);


  isValidOrThrowAll({a:validator})({a:null});