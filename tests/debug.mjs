import {
  hasErrors,
  isValidOrThrow,
  isValid,
  isValidOrThrowAll,
  isValidOrLog,
  isValidOrLogAll,
  TypeValidationError,
  Integer,
  Numeric,
  SafeNumber
} from "garn-validator";
import is from "garn-validator";
import { stringify } from "../src/helpers.js";

const obj = {
  x: 1,
  f: (x) => x * 2,
  constructor: Number,
  classical: function classical(arg) {
    return arg;
  },
  myClass: class MyClass {},
};

console.log(
  stringify(obj)
);
