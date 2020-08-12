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
import "garn-validator/src/proxyDetection.js";

// isValidOrThrow(Numeric)(NaN);

// isValidOrThrow(SafeNumber)(Number.MIN_SAFE_INTEGER - 10000);

// isValidOrThrow(SafeNumber)(Number.MAX_SAFE_INTEGER + 1);

// console.log(
//   isValidOrThrow(Proxy)([])
// );

isValidOrLogAll([Number, Boolean, String, {a:1,b:2}])({a:true, b: 1});
