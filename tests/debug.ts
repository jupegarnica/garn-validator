import * as garnValidator from "../src/index.js";
import * as ValidatorTypes from "../src/index.d.ts";
garnValidator as typeof ValidatorTypes;

const { isValidOrThrow } = garnValidator;

let str:string ='hola';
str =  isValidOrThrow(Number)(null);
