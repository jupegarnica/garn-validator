<h1>garn-validator</h1>

Ultra fast runtime type validator without dependencies.

[![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)

[![npm downloads](https://img.shields.io/npm/dm/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)

[![Node Tests CI](https://github.com/jupegarnica/garn-validator/workflows/Node%20Tests%20CI/badge.svg?branch=master)](https://github.com/jupegarnica/garn-validator/actions?query=workflow%3A%22Node+Tests+CI%22)

[![Deno Tests CI](https://github.com/jupegarnica/garn-validator/workflows/Deno%20Tests%20CI/badge.svg?branch=master)](https://github.com/jupegarnica/garn-validator/actions?query=workflow%3A%22Deno+Tests+CI%22)


- Supports checking primitives or objects with **schemas**
- Easy to use and learn but **powerful**
- It's totally **composable**
- **Fast** and **without dependencies**
- **Six behaviors**:
  - `isValidOrThrow` returns `true` or fails (default export)
  - `isValid` returns `true` or `false`
  - `hasErrors` returns null or Array of errors
  - `isValidOrLog` returns `true` or `false` and log error
  - `isValidOrLogAll` returns `true` or `false` and log all errors
  - `isValidOrThrowAll` returns `true` or throws AggregateError
- Works with ESModules or CommonJS from **Node** 10.x or **Deno**
- Works in all modern browsers
- Works in all frontend frameworks: **React, Angular, Vue,** etc...

<h2>Example</h2>

```js
import is from "garn-validator";

const isValidPassword = is(
  String,
  (str) => str.length >= 8,
  /[a-z]/,
  /[A-Z]/,
  /[0-9]/,
  /[-_/!¡?¿$%&/()]/
);

isValidPassword("12345Aa?"); // true

const isValidName = is(String, (name) => name.length >= 3);

isValidName("qw"); // fails

const isValidAge = is(
  Number,
  (age) => age > 18,
  (age) => age < 40
);

isValidAge(15); // fails

// composition

const isValidUser = is({
  name: isValidName,
  age: isValidAge,
  password: isValidPassword,
  country: ["ES", "UK"], // 'ES' or 'UK'
});

isValidUser({
  name: "garn",
  age: 38,
  password: "1234", // incorrect
  country: "ES",
}); // it throws
```

<h1>Contents</h1>

- [Get started](#get-started)
  - [Node](#node)
    - [Import with ES Modules](#import-with-es-modules)
    - [Require with CommonJs](#require-with-commonjs)
  - [Deno](#deno)
  - [Basic Usage](#basic-usage)
    - [Check against constructor](#check-against-constructor)
    - [Check against primitive](#check-against-primitive)
    - [Check string against regex](#check-string-against-regex)
    - [Check against custom function](#check-against-custom-function)
    - [Check against enums (OR operator)](#check-against-enums-or-operator)
    - [Check multiple validations (AND operator)](#check-multiple-validations-and-operator)
    - [Check object against an schema](#check-object-against-an-schema)
  - [Behaviors](#behaviors)
- [In depth](#in-depth)
  - [Types of validations](#types-of-validations)
    - [Primitives](#primitives)
    - [Constructors](#constructors)
      - [Proxy detection](#proxy-detection)
    - [RegExp](#regexp)
    - [Custom function](#custom-function)
    - [Enums](#enums)
    - [Schema](#schema)
      - [Optional Keys](#optional-keys)
      - [Regexp keys](#regexp-keys)
      - [Custom validation used in schemas](#custom-validation-used-in-schemas)
    - [Validations in serie (AND operator)](#validations-in-serie-and-operator)
  - [Errors](#errors)
    - [isValidOrThrow vs isValidOrThrowAll](#isvalidorthrow-vs-isvalidorthrowall)
    - [AggregateError](#aggregateerror)
      - [SchemaValidationError](#schemavalidationerror)
      - [EnumValidationError](#enumvalidationerror)
      - [SerieValidationError](#serievalidationerror)
      - [hasErrors](#haserrors)
    - [Raw Error data](#raw-error-data)
    - [Composition in depth](#composition-in-depth)
  - [Especial cases](#especial-cases)
    - [AsyncFunction & GeneratorFunction](#asyncfunction--generatorfunction)
    - [arrayOf](#arrayof)
    - [objectOf](#objectof)
- [Roadmap](#roadmap)

# Get started

## Node

```bash
npm install garn-validator
```

### Import with ES Modules

```js
// default export is isValidOrThrow
import isValidOrThrow from "garn-validator";
// or use named exports
import { isValidOrThrow } from "garn-validator";
```

### Require with CommonJs

```js
const { isValidOrThrow } = require("garn-validator/commonjs");
// or use de default export
const isValidOrThrow = require("garn-validator/commonjs").default;
```

## Deno

The library can be used as is in typescript

Import from deno third party modules: [deno.land/x/garn_validator](https://deno.land/x/garn_validator)

```ts
// mod.ts
import is from "https://deno.land/x/garn_validator/src/index.js";
```

To have type definitions you can do:

```js

import * as garnValidator from "https://deno.land/x/garn_validator/src/index.js";
import * as ValidatorTypes from "https://deno.land/x/garn_validator/src/index.d.ts";
garnValidator as typeof ValidatorTypes;

const { isValidOrThrow } = garnValidator;

```

<!-- TODO ## Browser -->
<!-- https://jspm.org/ -->

## Basic Usage

```js
import is from "garn-validator"; // default export is isValidOrThrow

const isValidUser = is({ name: String, age: Number });

isValidUser({ name: "garn", age: 38 }); // true
isValidUser({ name: "garn", age: "38" }); // it throws
```

### Check against constructor

```js
is(Number)(2); // true
is(String)(2); // it throws
is(Array)([1, 2]); // true
is(Object)([1, 2]); // it throws
```
Learn more in depth at [Constructors](#constructors)


### Check against primitive

```js
is("a")("a"); // true
is(true)(false); // it throws
```
Learn more in depth at [Primitives](#primitives)


### Check string against regex

```js
is(/a*/)("a"); // true
is(/a/)("b"); // it throws
```
Learn more in depth at [RegExp](#regexp)


### Check against custom function

```js
is((value) => value > 0)(33); // true
is((value) => value > 0)(-1); // wil throw
is(Number.isNaN)(NaN); // true
is(Number.isInteger)(1.1); // wil throw
```
Learn more in depth at [Custom function](#custom-function)

### Check against enums (OR operator)

```js
is(["a", "b"])("a"); // true
is(["a", "b"])("c"); // it throws
is([Number, String])("18"); // true
is([null, undefined, false, 0, ""])(18); // it throws
```
Learn more in depth at [Enums](#enums)

### Check multiple validations (AND operator)

```js
is(Array, (array) => array.length === 2)([1, 2]); // true
is(
  (v) => v > 0,
  (v) => v < 50
)(100); // it throws
```
Learn more in depth at [Validations in serie (AND operator)](#validations-in-serie-and-operator)


### Check object against an schema

```js
const schema = { a: Number, b: Number }; // a and b are required
const obj = { a: 1, b: 2 };
is(schema)(obj); // true

is({ a: 1 })({ a: 1, b: 2 }); // true, a must be 1
is({ c: Number })({ a: 1, b: 2 }); // it throws (c is missing)

// Optional keys
is({ x$: String })({}); // true
```
Learn more in depth at [Schema](#schema)


## Behaviors

There are six behaviors that can be divided in two categories:

- It stops in first Error (quickest):

  - `isValidOrThrow` (returns true of throw the first error found)
  - `isValid` (returns true or false, never throws)
  - `isValidOrLog` (returns true or false and log first error, never throws)

- It collects all Errors:
  - `hasErrors` (return null or array of errors, never throws)
  - `isValidOrLogAll` (returns true or false and log all errors, never throws)
  - `isValidOrThrowAll` (returns true or throw )

The default export is `isValidOrThrow`

```js
import { isValid } from "garn-validator";

// stops in first Error
isValid(/[a-z]/)("g"); // returns true
isValid(/[a-z]/)("G"); // returns false, doesn't throws
```

```js
import { isValidOrLog } from "garn-validator";

// stops in first Error
isValidOrLog(/[a-z]/)("g"); // do nothing (but also returns true)
isValidOrLog(/[a-z]/)("G"); // logs error and return false
```

```js
import { hasErrors } from "garn-validator";

// return null or array or errors
// checks until the end
hasErrors(/[a-z]/)("g"); // null
hasErrors(/[a-z]/, Number)("G"); // [TypeValidationError, TypeValidationError]
```

```js
import { isValidOrThrowAll } from "garn-validator";

// return null or array or errors
// checks until the end
isValidOrThrowAll(/[a-z]/)("g"); // true
isValidOrThrowAll(/[a-z]/, Number)("G"); // throw AggregateError a key errors with  [TypeValidationError, TypeValidationError]
```

Learn more at [Errors](#errors)

<!-- TODO

## Utils
 -->


# In depth

## Types of validations

There are six types of validations: Primitives, Constructors, RegExp, Enums, Schemas and Custom functions

### Primitives

Checking a primitive is a === comparison

Anything that is not and object in JS is a primitive: `Number`, `String`, `undefined`, `null` and `Symbol`

```js
is(1)(1); // true  1 === 1

is("1")(1); // throws  '1' !== 1

is(1n)(1); // throws  1n !== 1

is(undefined)(null); // throws  undefined !== null

// keep in mind than a symbol is only equal to itself
let s = Symbol();
is(s)(s); // true
is(s)(Symbol()); // throws
```

### Constructors

Checking against a constructor means to know if the value evaluated has been created from that constructor

```js
is(Number)(2); // (2).constructor === Number  --> true
is(Symbol)(Symbol()); // true
```

A valid constructor is a `class` or any built-in constructor.

```js
class Car {}
let honda = new Car();
is(Car)(honda); // honda.constructor === Car  --> true
```

> **You can't use a normal function used as constructor from the old JS times.**

```js
function Car(name) {
  this.name = name;
}
let honda = new Car("honda");
is(Car)(honda); // throws.  Car is detected as custom validator function
```

All [built in Constructors](https://github.com/jupegarnica/garn-validator/blob/master/src/constructors.js#L47) are supported

#### Proxy detection

> NOT YET WORKING IN DENO

In order to detect any Object (or Array) is a Proxy we intercept the creation of Proxies.

To have that functionality you must `import "garn-validator/src/proxyDetection.js"` before any creation of Proxies you need to detect;

```js
import "garn-validator/src/proxyDetection.js";

const target = { a: 1 };
const proxy = new Proxy(target, {
  get: () => 33,
});

isValidOrThrow(Proxy)(proxy); // true
```

without running garn-validator/src/proxyDetection.js

```js
// NO IMPORT
const target = { a: 1 };
const proxy = new Proxy(target, {
  get: () => 33,
});

isValidOrThrow(Proxy)(proxy); // fails
```

### RegExp

The perfect validator to check strings. It does what you expect:

```js
let isLowerCased = is(/^[a-z]+$/);

isLowerCased("honda"); // /^[a-z]+$/.test('honda') --> true
// or building a regexp with the constructor RexExp;
is(new RegExp(/^[a-z]+$/))("honda"); //  true
```

### Custom function

Any function that is not a constructor is treated as custom validator.

It must return any truthy value in order to pass the validation.

```js
is((val) => val >= 0)(10); // true
is((val) => val >= 0)(-10); // throws

is(() => "I am truthy")(10); // true
is(() => [])(10); // true
```

To fail a validation may return a falsy value or throw an error.

If it returns a falsy value, the default error will be thrown: TypeValidationError

If it throws an error, that error will be thrown.

```js
is(() => false) (10); // throws TypeValidationError
is(() => 0) (10); // throws TypeValidationError

is(() => {
  throw new RangeError('ups');
} ) (10); // throws RangeError

is( () => {
  throw 'ups';
} ) (10); // throws 'ups'
```

### Enums

Enums works as OR operator. Must be an array which represent all options.

```js
let cities = ["valencia", "new york", "salzburg"];
is(cities)("valencia"); // true
is(cities)("madrid"); // throws
```

But it's much more powerful than checking against primitives. It can contain any type of validator.

It checks every item until one passes.

```js
let isNumberOrBigInt = [Number, BigInt]; // must be Number or BigInt
is(isNumberOrBigInt)(1n); // true
is(isNumberOrBigInt)(1); // true

let isFalsy = [0, "", null, undefined, false];
is(isFalsy)(""); // true

let isNumberAlike = [Number, (val) => val === Number(val)];
is(isNumberAlike)(1n); // true
is(isNumberAlike)(1); // true
is(isNumberAlike)("1"); // true
```

### Schema

An Schema is just a plain object telling in each key which validation must pass.

```js
let schema = {
  name: String, // required and be a Number
  age: (age) => age > 18, // required and be a greater than 18
  tel: [Number, String], // required and be Number or String
  role: ["admin", "user"], // required and be 'admin' or 'user'
  credentials: {
    // must be and object and will be validate with this "subSchema"
    pass: String,
    email: String,
  },
};
let obj = {
  name: "garn",
  age: 20,
  tel: "+34617819234",
  role: "admin",
  credentials: {
    pass: "1234",
    email: "email@example.com",
  },
};
is(schema)(obj); // true
```

> **Only the keys in the schema will be checked. Any key not present in the schema won't be checked**

```js
is({})({ a: 1 }); // true , a is not in the schema
```

#### Optional Keys

And optional key must be `undefined` , `null`, or pass the validation

```js
is({ x$: Number })({ x: 1 }); // true, x is present and is Number
is({ x$: String })({ x: 1 }); // it throws, x is present but is not String

is({ x$: String })({}); // true, x is undefined
is({ x$: String })({ x: undefined }); // true, x is undefined
is({ x$: String })({ x: null }); // true, x is null
```

You can use `key$` or `'key?'`. It would be nicer to have `key?` without quotes but is not valid JS

```js
is({ "x?": String })({}); // true
```

#### Regexp keys

You can validate multiple keys at once using a regexp key

```js
is({
  [/./]: String,
})({
  a: "a",
  b: "b",
}); // true

// or write it as plain string
is({
  "/./": String,
})({
  a: "a",
  b: 1, // fails
}); // throws

// only checks the keys that matches regex
is({
  [/^[a-z]+$/]: Number,
})({
  x: 1,
  y: 2,
  z: 3,
  CONSTANT: "foo", // not checked
}); // true, all lowercased keys are numbers
```

> **The required keys and optional won't be check against a regexp key**

```js
is({
  [/./]: Number,
  x: String, //  this required key has priority against regex key
})({
  x: "x", // not checked as Number, checked as String
}); // true,  x is String

is({
  [/./]: Number,
  x: String,
})({
  x: "x", // not checked as Number, checked as String
  y: "y", // checked as Number, fails
}); // throw

is({
  [/./]: Number,
  $x: String,
  y: String,
})({
  x: "x", // not checked as Number, checked as String
  y: "y", // checked as String
  z: 1, // checked as Number, fails
}); // throw
```

This feature is perfect to note that any key not specified in schema is not allowed

```js
is({
  x: String,
  [/./]: () => false,
})({
  x: "x",
  y: "y", // fails
});
```

#### Custom validation used in schemas

When using a custom validator inside an schema will be run with 3 arguments: `(value, root, keyName) => {}`

- value: the value present in that key from the object
- root: the whole object, not matter how deep the validation occurs
- keyName: the name of the key to be checked.

```js
//  against root obj
is({
  max: (val, root, keyName) => val > root.min,
  min: (val, root, keyName) => val < root.max,
})({
  max: 1,
  min: -1,
}); // true

is({
  max: (val, root, keyName) => val > root.min,
  min: (val, root, keyName) => val < root.max,
})({
  max: 10,
  min: 50,
}); // it throws

// all key must be at least 3 characters
is({
  [/./]: (val, root, keyName) => keyName.length > 3,
})({
  max: 1, // key too short
  longKey: 1, // valid key
}); // it throws, max key is too short
```

### Validations in serie (AND operator)

The validator constructor can receive as many validations as needed.

All will be checked until one fails

```js
const isArrayOfLength2 = is(Array, (array) => array.length === 2);
isArrayOfLength2([1, 2]); // true

is(
  (v) => v > 0,
  (v) => v < 50 // will fail
)(100); // it throws
```

```js
const isValidPassword = is(
  String, // must be an String
  (str) => str.length >= 8, // and its length must be at least 8
  /[a-z]/, // and must have at least one lowercase
  /[A-Z]/, // and must have at least one uppercase
  /[0-9]/, // and must have at least one number
  /[-_/!·$%&/()]/ // and must have at least one especial character
);

isValidPassword("12345wW-"); // true
isValidPassword("12345ww-"); // fails
```

## Errors

If a validation fails it will throw `new TypeValidationError(meaningfulMessage)` which inherits from `TypeError`. It can be imported.

If it throws an error from a custom validator, that error will be thrown.

```js
import { isValidOrThrow, TypeValidationError } from "garn-validator";

try {
  isValidOrThrow(Boolean)(33);
} catch (error) {
  error instanceof TypeValidationError; // true
  error instanceof TypeError; // true
}

try {
  isValidOrThrow(() => {
    throw "ups";
  })(33);
} catch (error) {
  error === "ups"; // true
}

try {
  isValidOrThrow(() => {
    throw new RangeError("out of range");
  })(33);
} catch (error) {
  error instanceof RangeError; // true
  error instanceof TypeError; // false
}
```

### isValidOrThrow vs isValidOrThrowAll

`isValidOrThrow` will always throw the first `TypeValidationError` it finds.

```js
try {
  isValidOrThrow({ a: Number, b: String })({ a: null, b: null });
} catch (error) {
  error instanceof TypeValidationError; // true
  error.message; // At path /a null do not match constructor Number
}
```

`isValidOrThrowAll` will throw an [`AggregateError`](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/AggregateError) with all errors found.

```js
try {
  isValidOrThrowAll({ a: Number, b: String })({ a: null, b: null });
} catch (error) {
  error instanceof AggregateError; // true
  error instanceof SchemaValidationError; // true
  console.log(error);
  /*
    SchemaValidationError: value {"a":null,"b":null} do not match schema {"a":Number,"b":String}
  */
  console.log(error.errors);
  /*
    [
      TypeValidationError: At path /a null do not match constructor Number ,
      TypeValidationError: At path /b null do not match constructor String ,
    ]
  */
}
```

But if it finds only one error, it will throw `TypeValidationError`, no AggregateError

```js
try {
  isValidOrThrowAll({ a: Number, b: String })({ a: null, b: "str" });
} catch (error) {
  console.log(error);
  /*
    TypeValidationError: At path /a null do not match constructor Number ,
  */
  error instanceof TypeValidationError; // true
  error instanceof SchemaValidationError; // false
}
```

### AggregateError

There are 3 types a `AggregateError` that can be thrown:

- `SchemaValidationError`: thrown when more than one key fails checking an schema
- `EnumValidationError`: thrown when all validations fails checking an enum
- `SerieValidationError`: thrown when more than one validation fails checking an Serie

All of them inherits from `AggregateError` and has a property errors with an array of all errors collected

```js
try {
  isValidOrThrowAll(Number, String)(null);
} catch (error) {
  error instanceof AggregateError; // true
  console.log(error.errors);
  /*
    [
      TypeValidationError: value null do not match constructor Number ,
      TypeValidationError: value null do not match constructor String ,
    ]
  */
}
```

#### SchemaValidationError

If using isValidOrThrowAll more than one key fails checking an Schema , it will throw a SchemaValidationError with all Errors aggregated in error.errors.

If only one key fail it will throw only that Error (not an AggregateError)

SchemaValidationError inherits from AggregateError,

> But if using `isValidOrThrow` only the first Error will be thrown.

```js
// more than 2 keys fails
try {
  isValidOrThrowAll({ a: 1, b: 2 })({});
} catch (error) {
  console.log(error instanceof SchemaValidationError); // true
  console.log(error instanceof AggregateError); // true
  console.log(error.errors.length); // 2
}

// only 1 key fails
try {
  isValidOrThrowAll({ a: 1 })({});
} catch (error) {
  console.log(error instanceof TypeError); // true
  console.log(error instanceof SchemaValidationError); // false
}
```

#### EnumValidationError

If all validations of an enum fails, it will throw a EnumValidationError with all Errors aggregated in error.errors

But if the length of the enum is 1, it will throw only that error.

EnumValidationError inherits from AggregateError.

```js
try {
  isValidOrThrow([Boolean, String])(1);
} catch (error) {
  console.log(error instanceof EnumValidationError); // true
  console.log(error instanceof AggregateError); // true
}

try {
  isValidOrThrow([Boolean])(1);
} catch (error) {
  console.log(error instanceof EnumValidationError); // false
  console.log(error instanceof TypeError); // true
}
```

#### SerieValidationError

If using isValidOrThrowAll fails all validations of a serie , it will throw a SerieValidationError with all Errors aggregated in error.errors

But if the length of the enum is 1. it will throw only this error.

SerieValidationError inherits from AggregateError.

```js
try {
  isValidOrThrowAll(Boolean, String)(1);
} catch (error) {
  console.log(error instanceof SerieValidationError); // true
  console.log(error instanceof AggregateError); // true
}

try {
  isValidOrThrowAll(Boolean)(1);
} catch (error) {
  console.log(error instanceof SerieValidationError); // false
  console.log(error instanceof TypeError); // true
}
```

#### hasErrors

`hasErrors` will flatMap all errors found. No AggregateError will be in the array returned.

```js
hasErrors(/[a-z]/)("g"); // null
hasErrors(/[a-z]/, Number)("G");
/*
[
  TypeValidationError: value "G" do not match regex /[a-z]/,
  TypeValidationError: value "G" do not match constructor Number ,
]
*/

hasErrors({ a: Number, b: String })({ a: null, b: null });
/*
[
  TypeValidationError: At path /a null do not match constructor Number,
  TypeValidationError: At path /b null do not match constructor String
]
*/
```

### Raw Error data

All errors the library throws has the raw data collected in a property called `raw`.

```js
try {
  isValidOrThrow({ a: Number })({ a: null });
} catch (error) {
  console.log(error.raw);
}
/*
{

  //  the validation failing
  type: [Function: Number],

  //  the value evaluated
  value: null,

  // the root object
  root: { a: null },

  // the key failing
  keyName: 'a',

  // the whole path where the evaluation happens as an array
  path: [ 'a' ],

  // the error message
  message: 'At path /a null do not match constructor Number',

   // the error constructor
  '$Error': [class TypeValidationError extends TypeError],

  // the behavior applied
  conf: {
    collectAllErrors: false,
    onValid: [Function: onValidDefault],
    onInvalid: [Function: onInvalidDefault]
  },
}
 */
```

### Composition in depth

You can create your own validators and use them as custom validation creating new ones.

```js
const isPositive = isValidOrThrow((v) => v > 0);
const isNotBig = isValidOrThrow((v) => v < 100);
const isNumber = isValidOrThrow([Number, String], (num) => num == Number(num));

isValidOrThrow(isNumber, isPositive, isNotBig)("10"); // true
isValidOrThrow(isNumber, isPositive, isNotBig)(200); // it throws
```

When used inside another kind of behavior, it will inherit the behavior from where it has been used.

```js
const isNotBig = isValidOrLog((v) => v < 100);
// its normal behavior
isNotBig(200); // false, logs '200 do not match validator (v) => v < 100'

isValid(isNotBig)(200); // false , and won't log
isValidOrThrow(isNotBig)(200); // fails , and won't log
hasErrors(isNotBig)(200); // array,  won't log
/*
[
  new TypeValidationError('200 do not match validator (v) => v < 100')
]
 */
```

Actually, it's not treated as a custom validation function. No matter is your are using `hasErrors` which return null when nothing fails, and it's just works.

```js
const isBigNumber = hasErrors(
  [Number, String],
  (num) => num == Number(num),
  (num) => num > 1000
);

// its normal behavior
isBigNumber("a12");
/* [
  new TypeValidationError(""a12" do not match validator (num) => num == Number(num)"),
  new TypeValidationError(""a12" do not match validator num => num > 1000"),
];
 */

// inherit behavior
isValidOrLog(isBigNumber)("a12"); // false, and log only one error value "a10" do not match validator (num) => num == Number(num)
```

## Especial cases

### AsyncFunction & GeneratorFunction

`AsyncFunction` and `GeneratorFunction` constructors are not in the global scope of any of the three JS environments (node, browser or deno). If you need to check an async function or a generator you can import them from garn-validator.

> Note: Async functions and generators are not normal function, so it will fail against Function constructor

```js
import is, { AsyncFunction, GeneratorFunction } from "garn-validator";

is(AsyncFunction)(async () => {}); // true
is(GeneratorFunction)(function* () {}); // true

is(Function)(function* () {}); // throws
is(Function)(async function () {}); // throws
```

### arrayOf

As we use the array `[]` as enum, if you need to check the items of an array, you should treat it as an object and check against an schema.

```js
import is from "garn-validator";

is(Array, { [/\d/]: Number })([1, 2, 3]); // true
is(Array, { [/\d/]: Number })([1, 2, "3"]); // throws
```

In order to not be so ugly you can import `arrayOf` from garn-validator as a shortcut to:

`export const arrayOf = type => isValid(Array, {[/^\d$/]: type})`

```js
import is, { arrayOf } from "garn-validator";

is(arrayOf(Number))([1, 2, 3]); // true
is(arrayOf(Number))([1, 2, "3"]); // throws
```

### objectOf

You can import `objectOf` from garn-validator as a shortcut to:

`export const objectOf = type => isValid(Object, {[/./]: type})`

```js
import is, { objectOf } from "garn-validator";

is(objectOf(Number))({ a: 1, b: 2 }); // true
is(objectOf(Number))({ a: 1, b: "2" }); // throws
```

# Roadmap

- [x] Check value by constructor
- [x] Enum type
- [x] Shape type
- [x] Custom validation with a function (value, root, keyName)
- [x] Check RegEx
- [x] Match object key by RegEx
- [x] Multiples behaviors
- [x] ArrayOf & objectOf
- [x] Multiples validations `isValid(String, val => val.length > 3, /^[a-z]+$/ )('foo')`
- [x] Schema with optionals key `{ 'optionalKey?': Number }` or `{ optionalKey$: Number }`
- [x] Setting for check all keys (no matter if it fails) and return (or throw) an array of errors
- [x] Support for deno
- [ ] Support for browser
- [ ] Behavior applyDefaultsOnError. (syntax `mustBe(Number).or(0)`)
- [ ] Async validation support
- [ ] More built-in utils functions
