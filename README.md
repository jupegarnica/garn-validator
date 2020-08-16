<h1>garn-validator:  <strong>Create validations with ease</strong> </h1>

<h2>Features</h2>

- Supports checking primitives or objects with **schemas**
- Apply default value if validation fails.
- Easy to use and learn but **powerful**
- It's totally **composable**
- **Fast** and **without dependencies**
- **Six behaviors**:
  - `mustBe` returns the value evaluated or it throws. (default export)
  - `isValid` returns `true` or `false`, never throws
  - `isValidOrLog` returns `true` or `false` and log error, never throws
  - `hasErrors` returns null or Array of errors, never throws
  - `mustBeOrThrowAll` returns the value evaluated or throws AggregateError
  - `isValidOrLogAll` returns `true` or `false` and log all errors, never throws
- Works with ESModules or CommonJS from **Node** 10.x or **Deno**
- Works in all modern browsers
- Works in all frontend frameworks: **React, Angular, Vue,** etc...

[![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)
[![npm downloads](https://img.shields.io/npm/dm/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)
[![Node Tests CI](https://github.com/jupegarnica/garn-validator/workflows/Node%20Tests%20CI/badge.svg?branch=master)](https://github.com/jupegarnica/garn-validator/actions?query=workflow%3A%22Node+Tests+CI%22)
[![Deno Tests CI](https://github.com/jupegarnica/garn-validator/workflows/Deno%20Tests%20CI/badge.svg?branch=master)](https://github.com/jupegarnica/garn-validator/actions?query=workflow%3A%22Deno+Tests+CI%22)


> DEPRECATION WARNING: `isValidOrThrow` behavior has been deprecated in favor of `mustBe`.  Learn more at [mustBe](#mustbe)

<h2>Example</h2>

```js
import mustBe from "garn-validator";

const isValidPassword = mustBe(
  String, //  must be String
  (str) => str.length >= 8, // and length >= 8
  /[a-z]/, // and have at least one lowercase
  /[A-Z]/, // and have at least one uppercase
  /[0-9]/, // and have at least one digit
  /[-_/!¡?¿$%&/()]/ // and have at least one especial character
);

isValidPassword("12345Aa?"); // returns "12345Aa?"

const isValidName = mustBe(String, (name) => name.length > 3).or("anonymous"); // will auto correct to 'anonymous' if fails

isValidName("qw"); // return 'anonymous'

const isValidAge = mustBe(
  Number,
  (age) => age > 18,
  (age) => age < 40
);

// isValidAge(15); // fails

// composition

const isValidUser = mustBe({
  name: isValidName,
  age: isValidAge,
  password: isValidPassword,
  country: ["ES", "UK"], // 'ES' or 'UK'
});

const newUser = isValidUser({
  name: "", // will be fixed
  age: 38,
  password: "12345zZ?",
  country: "ES",
}); // returns { name: 'anonymous', age: 38, password: '12345zZ?', country: 'ES' }


const anotherUser = isValidUser({
  name: "garn",
  age: 38,
  password: "1234", // incorrect
  country: "ES",
}); // it throws --> TypeValidationError: At path /password "1234" do not match validator (str) => str.length >= 8
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
    - [mustBe](#mustbe)
    - [isValid, isValidOrLog and isValidOrLogAll](#isvalid-isvalidorlog-and-isvalidorlogall)
    - [hasErrors](#haserrors)
    - [mustBe vs mustBeOrThrowAll](#mustbe-vs-mustbeorthrowall)
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
    - [AggregateError](#aggregateerror)
      - [SchemaValidationError](#schemavalidationerror)
      - [EnumValidationError](#enumvalidationerror)
      - [SerieValidationError](#serievalidationerror)
      - [hasErrors](#haserrors-1)
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
// default export is mustBe
import mustBe from "garn-validator";
// or use named export
import { mustBe } from "garn-validator";
```

### Require with CommonJs

```js
const { mustBe } = require("garn-validator/commonjs");
// or use de default export
const mustBe = require("garn-validator/commonjs").default;
```

## Deno

The library can be used as is in typescript

Import from deno third party modules: [deno.land/x/garn_validator](https://deno.land/x/garn_validator)

```ts
// mod.ts
import mustBe from "https://deno.land/x/garn_validator/src/index.js";
```

To have type definitions you can do:

```js

import * as garnValidator from "https://deno.land/x/garn_validator/src/index.js";
import * as ValidatorTypes from "https://deno.land/x/garn_validator/src/index.d.ts";
garnValidator as typeof ValidatorTypes;

const { mustBe } = garnValidator;

```

<!-- TODO ## Browser -->
<!-- https://jspm.org/ -->

## Basic Usage

```js
import mustBe from "garn-validator"; // default export is mustBe

const isValidUser = mustBe({ name: String, age: Number });

isValidUser({ name: "garn", age: 38 }); // returns { name: "garn", age: 38 }
isValidUser({ name: "garn", age: "38" }); // it throws
```

### Check against constructor

```js
mustBe(Number)(2); // returns 2
mustBe(String)(2); // it throws
mustBe(Array)([1, 2]); // returns [1, 2]
mustBe(Object)([1, 2]); // it throws
```

Learn more in depth at [Constructors](#constructors)

### Check against primitive

```js
mustBe("a")("a"); // returns "a"
mustBe(true)(false); // it throws
```

Learn more in depth at [Primitives](#primitives)

### Check string against regex

```js
mustBe(/a*/)("a"); // returns "a"
mustBe(/a/)("b"); // it throws
```

Learn more in depth at [RegExp](#regexp)

### Check against custom function

```js
mustBe((value) => value > 0)(33); // returns 33
mustBe((value) => value > 0)(-1); // wil throw
mustBe(Number.isNaN)(NaN); // returns NaN
mustBe(Number.isInteger)(1.1); // wil throw
```

Learn more in depth at [Custom function](#custom-function)

### Check against enums (OR operator)

```js
mustBe(["a", "b"])("a"); // returns "a"
mustBe(["a", "b"])("c"); // it throws
mustBe([Number, String])("18"); // returns "18"
mustBe([null, undefined, false, 0, ""])(18); // it throws
```

Learn more in depth at [Enums](#enums)

### Check multiple validations (AND operator)

```js
mustBe(Array, (array) => array.length === 2)([1, 2]); // returns [1, 2]
mustBe(
  (v) => v > 0,
  (v) => v < 50
)(100); // it throws
```

Learn more in depth at [Validations in serie (AND operator)](#validations-in-serie-and-operator)

### Check object against an schema

```js
const schema = { a: Number, b: Number }; // a and b are required
const obj = { a: 1, b: 2 };
mustBe(schema)(obj); // returns obj

mustBe({ a: 1 })({ a: 1, b: 2 }); // returns { a: 1, b: 2 }, a must be 1
mustBe({ c: Number })({ a: 1, b: 2 }); // it throws (c is missing)

// Optional keys
mustBe({ x$: String })({}); // returns {}
```

Learn more in depth at [Schema](#schema)

## Behaviors

All behaviors run the same algorithm but differs in what returns and how behaves.

There are six behaviors that can be divided in two categories:

- It stops in first error (bail):

  - `mustBe` returns the value evaluated or it throws. (default export)
  - `isValid` returns `true` or `false`, never throws
  - `isValidOrLog` returns `true` or `false` and log error, never throws

- It collects all Errors:
  - `hasErrors` returns null or Array of errors, never throws
  - `mustBeOrThrowAll` returns the value evaluated or throws AggregateError
  - `isValidOrLogAll` returns `true` or `false` and log all errors, never throws

### mustBe

`mustBe` returns the value evaluated or it throws.

```js
let input = "Garn";
let userName = mustBe(String)(input); //  return 'Garn'
```

```js
let input = "Garn";
let userName;
let isValidName = mustBe(String, (val) => val.length > 4);
try {
  userName = isValidName(input); //  it throws
} catch (err) {
  userName = "anonymous";
}
```

`mustBe` may have attached an .or() to apply a default value if the validation fail.

```js
let input = "Garn";
let isValidName = mustBe(String, (val) => val.length > 4).or("anonymous");
let userName = isValidName(input); //  returns 'anonymous'
```

The .or() can receive a function to apply a transformation to the original value.

```js
let input = "42";
let asNumber = mustBe(Number).or((value /* "42" */) => Number(value));
let number = asNumber(input); //  returns 42
```

If you need to apply a function as default, you can use a function the returns a function.

```js
let input = "i am not a function";
let noop = () => {};
let mustBeFunction = mustBe(Function).or(() => noop);
let fn = mustBeFunction(input); //  returns () => {}
```

It can work nested in a schema

```js
let input = { name: "Garn" };
let isValidName = mustBe(String, (val) => val.length > 4).or("anonymous");

let user = mustBe({ name: isValidName })(input); // { name:'anonymous' }
```

If the .or() fails the whole validation will fail

```js
let input = "not a valid number";
let transformToNumberIfPosible = (maybeNumber) => {
  let number = Number(maybeNumber);
  if (number == maybeNumber) return number;
  else throw new TypeError("not valid number");
};
let asNumber = mustBe(Number).or(transformToNumberIfPosible);
let number = asNumber(input); //  it throws TypeError: not valid number
```

### isValid, isValidOrLog and isValidOrLogAll

`isValid` returns `true` or `false` never throws, so if it fails for any reason you should know it won't tell you anything but false.

```js
import { isValid } from "garn-validator";

// stops in first Error
isValid(/[a-z]/)("g"); // returns true
isValid(/[a-z]/)("G"); // returns false, doesn't throws
```

`isValidOrLog` is the same as `isValid` but log first error found and stops validating.

`isValidOrLogAll` returns `true` or `false` and log all errors, never throws

```js
import { isValidOrLog } from "garn-validator";

// stops in first Error
isValidOrLog(/[a-z]/)("g"); // do nothing (but also returns true)
isValidOrLog(/[a-z]/)("G"); // logs error and return false
```

### hasErrors

`hasErrors` returns null or Array with all errors found, never throws.

It's very useful to show the user all errors that need to be fixed.

```js
import { hasErrors } from "garn-validator";

// return null or array or errors
// checks until the end
hasErrors(/[a-z]/)("g"); // null
hasErrors(/[a-z]/, Number)("G"); // [TypeValidationError, TypeValidationError]
```

### mustBe vs mustBeOrThrowAll

`mustBe` returns the value evaluated or it throws the first error found.

```js
try {
  mustBe({ a: Number, b: String })({ a: null, b: null });
} catch (error) {
  error instanceof TypeValidationError; // true
  error.message; // At path /a null do not match constructor Number
}
```

`mustBeOrThrowAll` returns the value evaluated or it throws an [`AggregateError`](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/AggregateError) with all errors found.

```js
try {
  mustBeOrThrowAll({ a: Number, b: String })({ a: null, b: null });
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
  mustBeOrThrowAll({ a: Number, b: String })({ a: null, b: "str" });
} catch (error) {
  console.log(error);
  /*
    TypeValidationError: At path /a null do not match constructor Number ,
  */
  error instanceof TypeValidationError; // true
  error instanceof SchemaValidationError; // false
}
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
mustBe(1)(1); // returns 1 --> 1 === 1

mustBe("1")(1); // throws,  '1' !== 1

mustBe(1n)(1); // throws,  1n !== 1

mustBe(undefined)(null); // throws,  undefined !== null

// keep in mind than a symbol is only equal to itself
let s = Symbol();
mustBe(s)(s); // returns s
mustBe(s)(Symbol()); // throws
```

### Constructors

Checking against a constructor means to know if the value evaluated has been created from that constructor

```js
mustBe(Number)(2); // (2).constructor === Number  --> true
mustBe(Symbol)(Symbol()); // ok
```

A valid constructor is a `class` or any built-in constructor.

```js
class Car {}
let honda = new Car();
mustBe(Car)(honda); // honda.constructor === Car  --> true
```

> **You can't use a normal function used as constructor from the old JS times.**

```js
function Car(name) {
  this.name = name;
}
let honda = new Car("honda");
mustBe(Car)(honda); // throws.  Car is detected as custom validator function
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

mustBe(Proxy)(proxy); // returns proxy
```

without running garn-validator/src/proxyDetection.js

```js
// NO IMPORT
const target = { a: 1 };
const proxy = new Proxy(target, {
  get: () => 33,
});

mustBe(Proxy)(proxy); // fails
```

### RegExp

The perfect validator to check strings. It does what you expect:

```js
let isLowerCased = mustBe(/^[a-z]+$/);

isLowerCased("honda"); // /^[a-z]+$/.test('honda') --> true
// or building a regexp with the constructor RexExp;
mustBe(new RegExp(/^[a-z]+$/))("honda"); //  true
```

### Custom function

Any function that is not a constructor is treated as custom validator.

It must return any truthy value in order to pass the validation.

```js
mustBe((val) => val >= 0)(10); // returns 10
mustBe((val) => val >= 0)(-10); // throws

mustBe(() => "I am truthy")(10); // returns 10
mustBe(() => [])(10); // returns 10
```

To fail a validation may return a falsy value or throw an error.

If it returns a falsy value, the default error will be thrown: TypeValidationError

If it throws an error, that error will be thrown.

```js
mustBe(() => false)(10); // throws TypeValidationError
mustBe(() => 0)(10); // throws TypeValidationError

mustBe(() => {
  throw new RangeError("ups");
})(10); // throws RangeError

mustBe(() => {
  throw "ups";
})(10); // throws 'ups'
```

### Enums

Enums works as OR operator. Must be an array which represent all options.

```js
let cities = ["valencia", "new york", "salzburg"];
mustBe(cities)("valencia"); // returns "valencia"
mustBe(cities)("madrid"); // throws
```

But it's much more powerful than checking against primitives. It can contain any type of validator.

It checks every item until one passes.

```js
let isNumberOrBigInt = [Number, BigInt]; // must be Number or BigInt
mustBe(isNumberOrBigInt)(1n); // returns 1n
mustBe(isNumberOrBigInt)(1); // returns 1

let isFalsy = [0, "", null, undefined, false];
mustBe(isFalsy)(""); // returns ""

let isNumberAlike = [Number, (val) => val === Number(val)];
mustBe(isNumberAlike)(1n); // returns 1n
mustBe(isNumberAlike)(1); // returns 1
mustBe(isNumberAlike)("1"); // returns "1"
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
mustBe(schema)(obj); // returns obj
```

> **Only the keys in the schema will be checked. Any key not present in the schema won't be checked  (under consideration to be changed)**

```js
mustBe({})({ a: 1 }); // returns { a: 1 } , a is not in the schema
```

#### Optional Keys

And optional key must be `undefined` , `null`, or pass the validation

```js
mustBe({ x$: Number })({ x: 1 }); // returns { x: 1 }, x is present and is Number
mustBe({ x$: String })({ x: 1 }); // it throws, x is present but is not String

mustBe({ x$: String })({}); // returns {}, x is undefined
mustBe({ x$: String })({ x: undefined }); // returns { x: undefined }, x is undefined
mustBe({ x$: String })({ x: null }); // returns { x: null }, x is null
```

You can use `key$` or `'key?'`. It would be nicer to have `key?` without quotes but is not valid JS

```js
mustBe({ "x?": String })({}); // returns {}
```

#### Regexp keys

You can validate multiple keys at once using a regexp key

```js
mustBe({
  [/./]: String,
})({
  a: "a",
  b: "b",
}); // ok

// or write it as plain string
mustBe({
  "/./": String,
})({
  a: "a",
  b: 1, // fails
}); // throws

// only checks the keys that matches regex
mustBe({
  [/^[a-z]+$/]: Number,
})({
  x: 1,
  y: 2,
  z: 3,
  CONSTANT: "foo", // not checked
}); // ok, all lowercased keys are numbers
```

> **The required keys and optional won't be check against a regexp key**

```js
mustBe({
  [/./]: Number,
  x: String, //  this required key has priority against regex key
})({
  x: "x", // not checked as Number, checked as String
}); // ok,  x is String

mustBe({
  [/./]: Number,
  x: String,
})({
  x: "x", // not checked as Number, checked as String
  y: "y", // checked as Number, fails
}); // throw

mustBe({
  [/./]: Number,
  $x: String,
  y: String,
})({
  x: "x", // not checked as Number, checked as String
  y: "y", // checked as String
  z: "z", // checked as Number, fails
}); // throw
```

This feature is perfect to note that any key not specified in schema is not allowed

```js
mustBe({
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
mustBe({
  max: (val, root, keyName) => val > root.min,
  min: (val, root, keyName) => val < root.max,
})({
  max: 1,
  min: -1,
}); // ok

mustBe({
  max: (val, root, keyName) => val > root.min,
  min: (val, root, keyName) => val < root.max,
})({
  max: 10,
  min: 50,
}); // it throws

// all key must be at least 3 characters
mustBe({
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
const isArrayOfLength2 = mustBe(Array, (array) => array.length === 2);
isArrayOfLength2([1, 2]); // returns [1, 2]

mustBe(
  (v) => v > 0,
  (v) => v < 50 // will fail
)(100); // it throws
```

```js
const isValidPassword = mustBe(
  String, // must be an String
  (str) => str.length >= 8, // and its length must be at least 8
  /[a-z]/, // and must have at least one lowercase
  /[A-Z]/, // and must have at least one uppercase
  /[0-9]/, // and must have at least one number
  /[-_/!·$%&/()]/ // and must have at least one especial character
);

isValidPassword("12345wW-"); // returns "12345wW-"
isValidPassword("12345"); // fails
```

## Errors

If a validation fails it will throw `new TypeValidationError(meaningfulMessage)` which inherits from `TypeError`. It can be imported.

If it throws an error from a custom validator, that error will be thrown.

```js
import { mustBe, TypeValidationError } from "garn-validator";

try {
  mustBe(Boolean)(33);
} catch (error) {
  error instanceof TypeValidationError; // true
  error instanceof TypeError; // true
}

try {
  mustBe(() => {
    throw "ups";
  })(33);
} catch (error) {
  error === "ups"; // true
}

try {
  mustBe(() => {
    throw new RangeError("out of range");
  })(33);
} catch (error) {
  error instanceof RangeError; // true
  error instanceof TypeError; // false
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
  mustBeOrThrowAll(Number, String)(null);
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

If using mustBeOrThrowAll more than one key fails checking an Schema , it will throw a SchemaValidationError with all Errors aggregated in error.errors.

If only one key fail it will throw only that Error (not an AggregateError)

SchemaValidationError inherits from AggregateError,

> But if using `mustBe` only the first Error will be thrown.

```js
// more than 2 keys fails
try {
  mustBeOrThrowAll({ a: 1, b: 2 })({});
} catch (error) {
  console.log(error instanceof SchemaValidationError); // true
  console.log(error instanceof AggregateError); // true
  console.log(error.errors.length); // 2
}

// only 1 key fails
try {
  mustBeOrThrowAll({ a: 1 })({});
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
  mustBe([Boolean, String])(1);
} catch (error) {
  console.log(error instanceof EnumValidationError); // true
  console.log(error instanceof AggregateError); // true
}

try {
  mustBe([Boolean])(1);
} catch (error) {
  console.log(error instanceof EnumValidationError); // false
  console.log(error instanceof TypeError); // true
}
```

#### SerieValidationError

If using mustBeOrThrowAll fails all validations of a serie , it will throw a SerieValidationError with all Errors aggregated in error.errors

But if the length of the enum is 1. it will throw only this error.

SerieValidationError inherits from AggregateError.

```js
try {
  mustBeOrThrowAll(Boolean, String)(1);
} catch (error) {
  console.log(error instanceof SerieValidationError); // true
  console.log(error instanceof AggregateError); // true
}

try {
  mustBeOrThrowAll(Boolean)(1);
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
  mustBe({ a: Number })({ a: null });
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
  behavior: {
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
const isPositive = mustBe((v) => v > 0);
const isNotBig = mustBe((v) => v < 100);
const isNumber = mustBe([Number, String], (num) => num == Number(num));

mustBe(isNumber, isPositive, isNotBig)("10"); // returns "10"
mustBe(isNumber, isPositive, isNotBig)(200); // it throws
```

When used inside another kind of behavior, it will inherit the behavior from where it has been used.

```js
const isNotBig = isValidOrLog((v) => v < 100);
// its normal behavior
isNotBig(200); // false, logs '200 do not match validator (v) => v < 100'

isValid(isNotBig)(200); // false , and won't log
mustBe(isNotBig)(200); // fails , and won't log
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
import mustBe, { AsyncFunction, GeneratorFunction } from "garn-validator";

mustBe(AsyncFunction)(async () => {}); // ok
mustBe(GeneratorFunction)(function* () {}); // ok

mustBe(Function)(function* () {}); // throws
mustBe(Function)(async function () {}); // throws
```

### arrayOf

As we use the array `[]` as enum, if you need to check the items of an array, you should treat it as an object and check against an schema.

```js
import mustBe from "garn-validator";

mustBe(Array, { [/\d/]: Number })([1, 2, 3]); // returns [1, 2, 3]
mustBe(Array, { [/\d/]: Number })([1, 2, "3"]); // throws
```

In order to not be so ugly you can import `arrayOf` from garn-validator as a shortcut to:

`export const arrayOf = type => isValid(Array, {[/^\d$/]: type})`

```js
import mustBe, { arrayOf } from "garn-validator";

mustBe(arrayOf(Number))([1, 2, 3]); // returns [1, 2, 3]
mustBe(arrayOf(Number))([1, 2, "3"]); // throws
```

### objectOf

You can import `objectOf` from garn-validator as a shortcut to:

`export const objectOf = type => isValid(Object, {[/./]: type})`

```js
import mustBe, { objectOf } from "garn-validator";

mustBe(objectOf(Number))({ a: 1, b: 2 }); // returns { a: 1, b: 2 }
mustBe(objectOf(Number))({ a: 1, b: "2" }); // throws
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
- [x] Support for browser
- [x] Behavior applyDefaultsOnError. (syntax `mustBe(Number).or(0)`)
- [ ] Async validation support
- [ ] More built-in utils functions
