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

const isValidPassword = is(
  String,
  (str) => str.length >= 8,
  /[a-z]/,
  /[A-Z]/,
  /[0-9]/,
  /[-_/!¡?¿$%&/()]/
);

// let fn = function () {};
// let validate =  isValidOrThrow({
//     toString: Function,
//   });


// console.log(isValidPassword.displayName);

// 'use strict'



// // isValidPassword("12345Aa?"); // true

const isValidName = is(String, (name) => name.length >= 3);

// isValidName("qw"); // fails

const isValidAge = is(
  Number,
  (age) => age > 18,
  (age) => age < 40
);

// isValidAge(15); // fails

// composition

const isValidUser = isValidOrLogAll({
  name: isValidName,
  age: isValidAge,
  password: isValidPassword,
  country: ["ES", "UK"], // 'ES' or 'UK'
});

isValidUser({
  name: "gn",
  age: 381,
  password: "12345A?", // incorrect
  country: "ES",
}); // it throws
// import "garn-validator/src/proxyDetection.js";

// isValidOrThrow(Numeric)(NaN);

// isValidOrThrow(SafeNumber)(Number.MIN_SAFE_INTEGER - 10000);

// isValidOrThrow(SafeNumber)(Number.MAX_SAFE_INTEGER + 1);

// console.log(
//   isValidOrThrow(Proxy)([])
// );

// isValidOrLogAll([Number, Boolean, String, {a:1,b:2}, null])({a:true, b: 1});

// const nullish = ()=> null
// const isNumber = isValid({a:[Number,BigInt]});

// isValidOrLogAll(nullish,isNumber)('hola')
