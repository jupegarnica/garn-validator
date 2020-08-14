import * as garnValidator from "../src/index.js";
import * as ValidatorTypes from "../src/index.d.ts";
garnValidator as typeof ValidatorTypes;

const { mustBe } = garnValidator;

let str:string ='hola';
str =  mustBe(Number)(null);
