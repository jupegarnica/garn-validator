# Garn-validator

Ultra fast runtime type validator for vanilla JS without dependencies.

[![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)

# Features

- Ultra light and **fast**  with **0 dependencies**
- Support for checking primitives or  objects with schemas
- Easy to use and simple to learn but powerful
- 5 behaviors (`isValid`, `isValidOrThrow`, `isValidOrLogAllErrors`, `isValidOrLog` and `hasErrors`)
- Works with ESModules or CommonJS from node 10.x to latests

# Get started

## Install

```bash
npm install garn-validator
```

#### Import with ES Modules

```js
// default export is isValidOrThrow
import isValidOrThrow from "garn-validator";
// or use named exports
import { isValidOrThrow } from "garn-validator";
```

#### Require with CommonJs

```js
const { isValidOrThrow } = require("garn-validator/commonjs");
// or use de default export
const isValidOrThrow = require("garn-validator/commonjs").default;
```

## Basic Use

```js
import is from "garn-validator"; // default export is isValidOrThrow

const isValidUser = is({name: String, age: Number});

isValidUser({name:'garn', age: 38}); // true
isValidUser({name:'garn', age: '38'}); // it throws
```

### Check against built-in constructors

```js
is(Number)(2); // true
is(String)(2); // it throws
is(Array)([1,2]); // true
is(Object)([1,2]); // it throws
```

### Check against primitive

```js
is("a")("a"); // true
is(true)(false); // it throws
```

### Check string against regex

```js
is(/a*/)("a"); // true
is(/a/)("b"); // it throws
```

### Check against custom function
```js
is( value => value > 0)(33); // true
is( value => value > 0)(-1); // wil throw
is( Number.isNaN )(NaN); // true
is( Number.isInteger )(1); // true
is( Number.isInteger )(1.1); // wil throw
```

### Check against enums (OR operator)
```js
is( ["a", "b"] )("a"); // true
is( ["a", "b"] )("c"); // it throws
is( [Number, String] )("18"); // true
is( [null, undefined, false, v => v < 0] )(18); // it throws
```


### Check multiple validations (AND operator)
```js
is(Array, array => array.length === 2)([1, 2]); // true
is(v => v > 0, v => v < 50)(100); // it throws
```

### Check objects against an schema
```js
const schema = { a: Number, b: Number }; // a and b are required
const obj = { a: 1, b: 2 };
is(schema)(obj); // true

is({ a: 1 })(obj); // true, a is 1
is({ c: 1 })(obj); // it throws (c is missing)

// check all keys that matches regex
is({ [/[a-z]/]: Number })({
  x: 1,
  y: 2,
  z: 3,
  CONSTANT: "foo",
}); // true, all lowercased keys are numbers

// optional keys
is({ x$: Number })({ x: 1 }); // true, x is present and is Number
is({ x$: String })({ x: 1 }); // it throws, x is present but is not String
is({ x$: String })({}); // true, x is undefined
is({ x$: String })({x: null}); // true, x is null

// you can use key$ or 'key?',
// it would be nicer to have key? without quotes but is not valid JS

is({ "x?": String })({}); // true
```

### Composable

```js
// Simple example
const isPositive = is((v) => v > 0);
const isNotBig = is((v) => v < 100);

isPositive(-2); // it throws

is(isPositive, isNotBig)(200); // it throws

// Real example
const isValidPassword = is(
  String,
  (str) => str.length >= 8,
  /[a-z]/,
  /[A-Z]/,
  /[0-9]/,
  /[-_/!·$%&/()]/
);

const isValidName = is(String, (name) => name.length >= 3);
const isValidAge = is(
  Number,
  (age) => age > 18,
  (age) => age < 40
);

const isValidUser = is({
  name: isValidName,
  age: isValidAge,
  password: isValidPassword,
  country: ["ES", "UK"],
});

isValidUser({
  name: "garn",
  age: 38,
  password: "12345aA-",
  country: "ES",
}); // ok

isValidUser({
  name: "garn",
  age: 38,
  password: "1234", // incorrect
  country: "ES",
}); // it throws
```

### Behaviors

There are 5 behaviors you can import:

- `isValidOrThrow` (returns true of throw the first error found)
- `hasErrors` (return null or array of errors, never throws)
- `isValid` (returns true or false, never throws)
- `isValidOrLog` (returns true or false and log first error, never throws)
- `isValidOrLogAllErrors` (returns true or false and log all errors, never throws)
- `isValidOrThrowAllErrors` (returns true or throw [AggregateError](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/AggregateError) with all errors found)

The default export is `isValidOrThrow`

Learn more at [errors.test.js](https://github.com/jupegarnica/garn-validator/blob/master/tests/errors.test.js)

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
hasErrors(/[a-z]/, Number)("G"); // [TypeError, TypeError]
```

## Errors

If a validation fails by default it will throw `new TypeError(meaningfulMessage)`;

If using a custom validator throws an error , that error will be thrown.


### SchemaValidationError using `isValidOrThrowAllErrors`


If more than one key fails checking an Schema , it will throw a SchemaValidationError with all Errors aggregated in error.errors.

If only one key fail it will throw only that Error (not an AggregateError)

SchemaValidationError inherits from AggregateError,

> But if using `isValidOrThrow`  only the first Error will be thrown.
```js

// more than 2 keys fails
try {
  isValidOrThrowAllErrors({a:1,b:2})({});
} catch (error) {
  console.log(error instanceof SchemaValidationError); // true
  console.log(error instanceof AggregateError); // true
  console.log(error.errors.length); // 2

}
try {
  isValidOrThrow({a:1,b:2})({});
} catch (error) {
  console.log(error instanceof SchemaValidationError); // false
  console.log(error instanceof TypeError); // true

}


// only 1 key fails
try {
  isValidOrThrowAllErrors({a:1})({});
} catch (error) {
  console.log(error instanceof TypeError); // true
  console.log(error instanceof SchemaValidationError); // false

}
```

### EnumValidationError

If fails all items of an enum, it will throw a EnumValidationError with all Errors aggregated in error.errors

But if the length of the enum is 1, it will throw only that error.

EnumValidationError inherits from AggregateError.

```js
try {
  isValidOrThrow([
    Boolean,
    String,
  ])(1);
} catch (error) {
  console.log(error instanceof EnumValidationError); // true
  console.log(error instanceof AggregateError); // true
}

try {
  isValidOrThrow([
    Boolean,
  ])(1);
} catch (error) {
  console.log(error instanceof EnumValidationError); // false
  console.log(error instanceof TypeError); // true
}
```


### SeriesValidationError using `isValidOrThrowAllErrors`

If fails all items of a serie of validations, it will throw a SeriesValidationError with all Errors aggregated in error.errors

But if the length of the enum is 1. it will throw only this error.

SeriesValidationError inherits from AggregateError.


```js
try {
  isValidOrThrowAllErrors(
    Boolean,
    String,
  )(1);
} catch (error) {
  console.log(error instanceof SeriesValidationError); // true
  console.log(error instanceof AggregateError); // true
}

try {
  isValidOrThrowAllErrors(
    Boolean,
  )(1);
} catch (error) {
  console.log(error instanceof SeriesValidationError); // false
  console.log(error instanceof TypeError); // true
}
```

### hasErrors

hasError will flatMap all errors found.  No AggregateError will be in the array returned.




## Especial cases

### AsyncFunction & GeneratorFunction

`AsyncFunction` and `GeneratorFunction` constructors are not in the global scope of any of the 3 JS environments (node, browser or node). If you need to check an async function or a generator you con import them from garn-validator.

> Note: Async functions and generators are not normal function, so it will fail against Function constructor

```js
import is, { AsyncFunction, GeneratorFunction } from "garn-validator";

is(AsyncFunction)(async () => {}); // true
is(GeneratorFunction)(function* () {}); // true

is(Function)(function* () {}); // throws
is(Function)(async function () {}); // throws
```

### arrayOf

As we use the array `[]` as enum, if you need to check the items of an array you should treat it as an object and check against an schema.

```js
import is from "garn-validator";

is(Array, { [/\d/]: Number })([1, 2, 3]); // true
is(Array, { [/\d/]: Number })([1, 2, "3"]); // throws
```

To not be so ugly you can import `arrayOf` from garn-validator as a shortcut to:

`export const arrayOf = type => isValidOrThrow(Array, {[/^\d$/]: type})`

```js
import is, { arrayOf } from "garn-validator";

is(arrayOf(Number))([1, 2, 3]); // true
is(arrayOf(Number))([1, 2, "3"]); // throws
```

### objectOf

You can import `objectOf` from garn-validator as a shortcut to:

`export const objectOf = type => isValidOrThrow(Object, {[/./]: type})`

```js
import is, { objectOf } from "garn-validator";

is(objectOf(Number))({ a: 1, b: 2 }); // true
is(objectOf(Number))({ a: 1, b: "2" }); // throws
```

## Roadmap

- [x] Check value by constructor
- [x] Enum type (oneOf & oneOfType)
- [x] Shape type
- [x] Custom type validation with a function (value, rootValue)
- [x] Check RegEx
- [x] Match object key by RegEx
- [x] Setting to change behavior (throw error , log error or custom logic)
- [x] ArrayOf & objectOf examples
- [x] Multiples validations `isValid(String, val => val.length > 3, /^[a-z]+$/ )('foo')`
- [x] Schema with optionals key `{ 'optionalKey?': Number }` or `{ optionalKey$: Number }`
- [x] Setting for check all keys (no matter if it fails) and return (or throw) an array of errors
- [ ] Async validation support
- [ ] Support for deno
- [ ] Support for browser

### More examples

Watch folder [tests](https://github.com/jupegarnica/garn-validator/tree/master/tests) to learn more.

<!-- inject tests -->
#### schema.test.js

[schema.test.js](https://github.com/jupegarnica/garn-validator/tree/master/tests/schema.test.js)

```js
import isValidOrThrow, { isValid, objectOf, arrayOf } from "garn-validator";
describe("check schema", () => {
  test("check with constructor", () => {
    expect(() => {
      isValidOrThrow({ a: Number })({
        a: 1,
        b: 2,
      }); // not throw, all ok
    }).not.toThrow();

    expect(() => {
      isValidOrThrow({ a: Number, c: Number })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      isValidOrThrow({ a: Number, c: undefined })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("keys on the schema are required", () => {
    expect(() => {
      isValidOrThrow({ a: 1 })({ a: 1, b: 2 });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({ c: 1 })({ a: 1, b: 2 });
    }).toThrow();
  });

  test("check with primitives", () => {
    expect(() => {
      isValidOrThrow({ a: 2 })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      isValidOrThrow({ a: 1 })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("check with custom function", () => {
    expect(() => {
      isValidOrThrow({ a: (val) => val < 0 })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      isValidOrThrow({ a: (val) => val > 0 })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("check with custom function", () => {
    let obj = { x: "x", y: "x" };
    expect(() => {
      isValidOrThrow({ x: (val, rootObject) => rootObject.y === val })(obj);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: -1,
      });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: 10,
      });
    }).toThrow();

    expect(() => {
      isValidOrThrow({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "y",
      });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "x",
      });
    }).toThrow();
  });
  test("match key with regex", () => {
    expect(() => {
      isValidOrThrow({ [/[a-z]/]: Number })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({ [/[a-z]/]: 0 })({
        a: 1,
        b: 2,
      });
    }).toThrow();
    expect(() => {
      // only throws if the key is matched
      isValidOrThrow({ [/[A-Z]/]: Number })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({ [/[a-z]/]: Number, a: 1 })({
        a: 1,
        b: 2,
      }); // not throw, all lowercase keys are numbers
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({ [/[a-z]/]: Number, a: 2 })({
        a: 1,
        b: 2,
      }); // will throw (a is not 2)
    }).toThrow();
  });
});

describe("check objects recursively", () => {
  const obj = {
    a: 1,
    deep: {
      x: "x",
      deeper: {
        y: "y",
        method: (v) => console.log(v),
        user: {
          name: "garn",
          city: {
            name: "narnia",
            cp: 46001,
            country: "ESP",
          },
        },
      },
    },
  };
  const schema = {
    a: Number,
    deep: {
      x: (val, root, key) => key === val,
      deeper: {
        y: "y",
        method: Function,
        user: {
          name: String,
          city: {
            name: (v) => v.length > 3,
            cp: [Number, String],
            country: ["ESP", "UK"],
          },
        },
      },
    },
  };
  test("should work", () => {
    expect(() => {
      isValidOrThrow(schema)(obj); // not throw, all ok
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      isValidOrThrow({ ...schema, a: String })(obj);
    }).toThrow();
  });
});

describe("optional keys", () => {
  test("if the key exists should be check", () => {
    expect(isValid({ a$: Number })({ a: 1 })).toBe(true);
    expect(isValid({ a$: String })({ a: 1 })).toBe(false);
  });

  test("if the key doesn't exists should be valid", () => {
    expect(isValid({ a$: Number })({})).toBe(true);
  });
  test("if the key is null or undefined should be valid", () => {
    expect(isValid({ a$: Number })({a:undefined})).toBe(true);
    expect(isValid({ a$: Number })({a:null})).toBe(true);
  });
  test("should work ending with $ or ?", () => {
    expect(isValid({ "a?": Number })({ a: 1 })).toBe(true);
    expect(isValid({ "a?": String })({ a: 1 })).toBe(false);
  });

  test("complex example should work", () => {
    expect(
      isValid({
        a$: Number,
        b: 2,
        c$: (v, r, key) => key === "c",
        d$: String,
      })({
        a: 1,
        b: 2,
        c: true,
      })
    ).toBe(true);
  });
  test("complex example should fail", () => {
    expect(
      isValid({
        a$: Number,
        b: 2,
        c$: (v, r, key) => key === "c",
        d$: String,
      })({
        a: true,
        b: 2,
        c: true,
      })
    ).toBe(false);
  });
});
describe("special cases", () => {
  test("required keys are more important than optional", () => {
    expect(() => {
      isValidOrThrow({
        a: String,
        a$: Number,
      })({
        a: "2",
      });
    }).not.toThrow();
  });
  test("required regExp keys do not check optional or required", () => {
    expect(() => {
      isValidOrThrow({
        a: String,
        a$: Number,
        [/a/]: Boolean,
      })({
        a: "2",
      });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        a: String,
        a$: Number,
        [/a/]: Boolean,
      })({
        a: "2",
        aa: 12,
      });
    }).toThrow();
  });
});
describe("check String or Array against an schema", () => {
  test("should check an string as an object", () => {
    expect(() => {
      isValidOrThrow({
        0: /[lL]/,
        1: (char) => char === "o",
      })("Lorem");
    }).not.toThrow();
    // expect(() => {
    //   isValidOrThrow({
    //     0: /[lL]/,
    //     1: (char) => char === "o",
    //     2: "R",
    //   })("Lorem");
    // }).toThrow();
    // expect(() => {
    //   isValidOrThrow({
    //     99: "a",
    //   })("Lorem");
    // }).toThrow();
  });
  test("should check an Array as an object", () => {
    expect(() => {
      isValidOrThrow({
        0: Number,
        1: Number,
      })([1, 2]);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        "/d/": Number,
      })([1, 2]);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        0: String,
      })([1, 2]);
    }).toThrow();
  });
});

describe("check a function against an schema", () => {
  test("should check an function as an object", () => {
    let fn = function () {};
    expect(() => {
      isValidOrThrow({
        toString: Function,
      })(fn);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        toString: Boolean,
      })(fn);
    }).toThrow();
  });
  test("should check an Array as an object", () => {
    expect(() => {
      isValidOrThrow({
        0: Number,
        1: Number,
      })([1, 2]);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        "/d/": Number,
      })([1, 2]);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow({
        0: String,
      })([1, 2]);
    }).toThrow();
  });
});

describe("arrayOf", () => {
  test("should work", () => {
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2, 3]);
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(arrayOf((n) => n > 0))([1, 2, 3]);
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      isValidOrThrow(arrayOf(Number))([1, 2, "3"]);
    }).toThrow();
    expect(() => {
      isValidOrThrow(arrayOf((n) => n > 0))([1, 2, -3]);
    }).toThrow();

    expect(() => {
      isValidOrThrow(arrayOf(Number))({ 0: 1, 1: 2 });
    }).toThrow();
  });
});

describe("objectOf", () => {
  test("should work", () => {
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1, b: 2 });
    }).not.toThrow();
    expect(() => {
      isValidOrThrow(objectOf((n) => n > 0))({ a: 1, b: 2 });
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      isValidOrThrow(objectOf(Number))({ a: 1, b: "2" });
    }).toThrow();
    expect(() => {
      isValidOrThrow(objectOf((n) => n > 0))({ a: 1, b: -2 });
    }).toThrow();
  });
});

describe("should check instances", () => {
  class MyClass {
    constructor() {
      this.date = new Date();
      this.name = "Garn";
      this.valid = false;
    }
  }
  test("should work", () => {
    expect(() => {
      isValidOrThrow({
        date: Date,
        name: String,
        valid: Boolean,
      })(new MyClass());
    }).not.toThrow();
  });
  test("should throw", () => {
    expect(() => {
      isValidOrThrow({
        date: Date,
        name: String,
        valid: Number,
      })(new MyClass());
    }).toThrow();
    expect(() => {
      isValidOrThrow(Object, {
        date: Date,
        name: String,
        valid: Boolean,
      })(new MyClass());
    }).toThrow();
  });
});

```

#### custom-validator.test.js

[custom-validator.test.js](https://github.com/jupegarnica/garn-validator/tree/master/tests/custom-validator.test.js)

```js
import isValidOrThrow from "garn-validator";

describe("check with custom validator", () => {
  test("you can return true or false", () => {
    expect(() => {
      isValidOrThrow(() => true)(33);
    }).not.toThrow();

    expect(() => {
      isValidOrThrow(() => false)(33);
    }).toThrow();
  });
  test("you can throw a custom message", () => {
    expect(() => {
      isValidOrThrow(() => {
        throw "ups";
      })(33);
    }).toThrow("ups");
  });
  test("by default throws TypeError", () => {
    expect(() => {
      isValidOrThrow(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("you can throw a custom type of error", () => {
    expect(() => {
      isValidOrThrow((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
});

```

#### errors.test.js

[errors.test.js](https://github.com/jupegarnica/garn-validator/tree/master/tests/errors.test.js)

```js
import {
  isValidOrThrow,
  hasErrors,
  isValidOrLogAllErrors,
  isValidOrThrowAllErrors,
  SchemaValidationError,
  EnumValidationError,
  SeriesValidationError,
} from "garn-validator";

describe("AggregateError", () => {
  test.each([AggregateError, SchemaValidationError, Error])(
    "if schema fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        isValidOrThrowAllErrors({ a: Number, b: String })({});
      }).toThrow(ErrorType);
    }
  );
  test.each([AggregateError, EnumValidationError, Error])(
    "if enums fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        isValidOrThrowAllErrors([Number, String])(true);
      }).toThrow(ErrorType);
    }
  );
  test.each([AggregateError, SeriesValidationError, Error])(
    "if Series fails with more than 2 errors should throw %p",
    (ErrorType) => {
      expect(() => {
        isValidOrThrowAllErrors(Number, String)(true);
      }).toThrow(ErrorType);
    }
  );
  test("checking schema should throw SchemaValidationError or TypeError", () => {
    try {
      isValidOrThrowAllErrors({ a: 1, b: 2 })({});
    } catch (error) {
      expect(error instanceof SchemaValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
      expect(error.errors.length).toBe(2);
    }
    try {
      isValidOrThrow({ a: 1, b: 2 })({});
    } catch (error) {
      expect(error instanceof SchemaValidationError).toBe(false);
      expect(error instanceof TypeError).toBe(true);
    }

    // only 1 key fails
    try {
      isValidOrThrowAllErrors({ a: 1 })({});
    } catch (error) {
      expect(error instanceof TypeError).toBe(true);
      expect(error instanceof SchemaValidationError).toBe(false);
    }
  });
  test("checking enum should throw EnumValidationError or TypeError", () => {
    try {
      isValidOrThrow([Boolean, String])(1);
    } catch (error) {
      expect(error instanceof EnumValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
    }

    try {
      isValidOrThrow([Boolean])(1);
    } catch (error) {
      expect(error instanceof EnumValidationError).toBe(false);
      expect(error instanceof TypeError).toBe(true);
    }
  });
  test("checking series should throw SeriesValidationError or TypeError ", () => {
    try {
      isValidOrThrowAllErrors(Boolean, String)(1);
    } catch (error) {
      expect(error instanceof SeriesValidationError).toBe(true);
      expect(error instanceof AggregateError).toBe(true);
    }

    try {
      isValidOrThrowAllErrors(Boolean)(1);
    } catch (error) {
      expect(error instanceof SeriesValidationError).toBe(false);
      expect(error instanceof TypeError).toBe(true);
    }
  });
});

describe("check errors", () => {
  test("by default throws TypeError", () => {
    expect(() => {
      isValidOrThrow(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("Should throw meaningfully message", () => {
    expect(() => {
      isValidOrThrow(1)(33);
    }).toThrow("value 33 do not match type 1");
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      isValidOrThrow((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
  test("should throw a custom type of error", () => {
    expect(() => {
      isValidOrThrow((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow("ups");
  });
  test("should throw anything", () => {
    try {
      isValidOrThrow((v) => {
        if (v > 10) throw "ups";
      })(33);
    } catch (error) {
      expect(error).toBe("ups");
    }
  });
  test("should throw anything", () => {
    try {
      isValidOrThrowAllErrors(
        () => {
          throw 1;
        },
        () => {
          throw 2;
        }
      )(33);
    } catch (error) {
      // error is AggregateError
      expect(error).toBeInstanceOf(AggregateError);
      expect(error.errors).toEqual([1, 2]);
    }
  });
  test("should format the schema", () => {
    expect(() => {
      isValidOrThrow({ a: Number })(33);
    }).toThrow('value 33 do not match type {"a":Number}');
  });
  test("should format the value", () => {
    expect(() => {
      isValidOrThrow({ a: Number })({ b: 33 });
    }).toThrow("on path /a value undefined do not match type Number");
  });
});

describe("check errors in serie", () => {
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      isValidOrThrow(Number, String)(2);
    }).toThrow("value 2 do not match type String");
  });
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      isValidOrThrow(() => {
        throw new Error();
      }, String)(2);
    }).toThrow(Error);
  });
  test("should check only until the first check fails", () => {
    jest.spyOn(global.console, "log");
    try {
      isValidOrThrow(
        () => {
          throw new Error();
        },
        () => console.log("I run?")
      )(2);
    } catch (err) {}
    expect(global.console.log).not.toHaveBeenCalled();
  });
});
describe("checking enums", () => {
  test("should throw AggregateError (EnumValidationError) if none pass", () => {
    try {
      isValidOrThrow([
        () => {
          throw "ups";
        },
        String,
      ])(1);
      throw "mec";
    } catch (error) {
      expect(error).toBeInstanceOf(EnumValidationError);
      expect(error).toBeInstanceOf(AggregateError);
    }
  });
});

describe("hasErrors", () => {
  test("should return null", () => {
    expect(
      hasErrors({ num: Number, str: String })({ num: 2, str: "str" })
    ).toBe(null);
  });
  test("should return array of errors", () => {
    expect(
      hasErrors({ num: Number, str: String })({ num: "2", str: "str" })
    ).toEqual([
      new TypeError('on path /num value "2" do not match type Number'),
    ]);
  });
  test("should flat all aggregated Errors", () => {
    expect(hasErrors(Number, { x: 1 }, () => false)(true).length).toBe(3);
  });

  test("should flat all aggregated Errors", () => {
    expect(hasErrors(Number, { x: 1, y: 2 }, [1, 2])({}).length).toBe(5);
  });

  describe("in serie", () => {
    test.each([
      [Number, (v) => v > 0, 2, null],
      [
        Number,
        (v) => v > 100,
        2,
        [new TypeError("value 2 do not match type v=>v>100")],
      ],
      [
        String,
        (v) => v > 100,
        2,
        [
          new TypeError("value 2 do not match type String"),
          new TypeError("value 2 do not match type v=>v>100"),
        ],
      ],
    ])("hasErrors(%p,%p)(%p) === %p", (a, b, input, expected) => {
      expect(hasErrors(a, b)(input)).toStrictEqual(expected);
    });
  });
  describe("in schema", () => {
    test.each([
      [{ num: Number }, { num: 2 }, null],
      [{ num: Number, str: String }, { num: 2, str: "str" }, null],
    ])(
      "should return null : hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toStrictEqual(expected);
      }
    );
    test.each([
      [
        { num: Number, str: String },
        { num: "2", str: "str" },
        [new TypeError('on path /num value "2" do not match type Number')],
      ],
      [
        { num: Number, str: String },
        { num: "2", str: null },
        [
          new TypeError('on path /num value "2" do not match type Number'),
          new TypeError("on path /str value null do not match type String"),
        ],
        // [
        //   new AggregateError(
        //     [
        //       new TypeError('on path /num value "2" do not match type Number'),
        //       new TypeError("on path /str value null do not match type String"),
        //     ],
        //     'value {"num":"2","str":null} do not match type {"num":Number,"str":String}'
        //   ),
        // ],
      ],
    ])(
      "should return array of errors hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toStrictEqual(expected);
      }
    );
  });
  describe("in recursive schema", () => {
    test.each([
      [{ obj: { num: Number } }, { obj: { num: 2 } }],
      [{ obj: { num: Number, str: String } }, { obj: { num: 2, str: "str" } }],
    ])("should return null : hasErrors(%p)(%p) === %p", (schema, obj) => {
      expect(hasErrors(schema)(obj)).toStrictEqual(null);
    });
    test.each([
      [
        { obj: { num: Number, str: String } },
        { obj: { num: "2", str: "str" } },
        [new TypeError('on path /obj/num value "2" do not match type Number')],
      ],
      [
        {
          thr: () => {
            throw new RangeError("ups");
          },
        },
        { thr: 1 },
        [new RangeError("ups")],
      ],
      [
        { obj: { num: Number, str: String } },
        { obj: { num: "2", str: null } },
        [
          new TypeError('on path /obj/num value "2" do not match type Number'),
          new TypeError("on path /obj/str value null do not match type String"),
        ],
        // [new AggregateError([
        //   new TypeError(
        //     'on path /obj/num value "2" do not match type Number'
        //   ),
        //   new TypeError(
        //     'on path /obj/str value null do not match type String'
        //   ),
        // ],'value {"num":"2","str":null} do not match type {"num":Number,"str":String}')],
      ],
    ])(
      "should return array of errors hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toEqual(expected);
      }
    );
  });
  describe("complex schema", () => {
    const schema = {
      name: /^[a-z]{3,}$/,
      age: (age) => age > 18,
      car: {
        brand: ["honda", "toyota"],
        date: Date,
        country: {
          name: String,
        },
        [/./]: () => {
          throw new EvalError("unexpected key");
        },
      },
      optional$: true,
      [/./]: () => false,
    };
    test("should return null ", () => {
      const obj = {
        name: "garn",
        age: 19,
        optional: true,
        car: {
          brand: "honda",
          date: new Date("1982-01-01"),
          country: {
            name: "Japan",
          },
        },
      };
      expect(hasErrors(schema)(obj)).toEqual(null);
    });
    test("should return errors", () => {
      const obj = {
        name: "Garn",
        age: 18,
        optional: false,
        car: {
          brand: "Honda",
          date: "1982-01-01",
          country: {
            NAME: "Japan",
          },
          evalError: null,
        },
        noValidKey: 1,
      };
      expect(hasErrors(schema)(obj)).toEqual([
        new TypeError(
          "on path /noValidKey value 1 do not match type ()=>false"
        ),
        new TypeError(
          'on path /name value "Garn" do not match type /^[a-z]{3,}$/'
        ),
        new TypeError("on path /age value 18 do not match type age=>age>18"),
        new EvalError("unexpected key"),
        new TypeError(
          'on path /car/brand value "Honda" do not match type "honda"'
        ),
        new TypeError(
          'on path /car/brand value "Honda" do not match type "toyota"'
        ),
        new TypeError(
          'on path /car/date value "1982-01-01" do not match type Date'
        ),
        new TypeError(
          "on path /car/country/name value undefined do not match type String"
        ),

        new TypeError("on path /optional value false do not match type true"),
      ]);
    });
  });
  describe("multiples schemas in series", () => {
    test("should return errors", () => {
      const schema1 = {
        x: Number,
      };
      const schema2 = {
        y: Boolean,
        z: Function,
      };
      const obj = {
        x: true,
        y: 1,
      };
      expect(hasErrors(schema1, schema2)(obj)).toEqual([
        new TypeError("on path /x value true do not match type Number"),
        new TypeError("on path /y value 1 do not match type Boolean"),
        new TypeError("on path /z value undefined do not match type Function"),
      ]);
    });
  });
});

describe("isValidOrThrowAllErrors ", () => {
  test("should throw AggregateError with all errors", () => {
    expect(() => {
      isValidOrThrowAllErrors(Number, String)(true);
    }).toThrow(AggregateError);

    expect(() => {
      isValidOrThrowAllErrors(Number, String)(true);
    }).not.toThrow(TypeError);
  });
  test("should throw 2 errors", () => {
    try {
      isValidOrThrowAllErrors(Number, Boolean, String)(true);
    } catch (error) {
      expect(error.errors.length).toBe(2);
    }
  });
});
describe("isValidOrLogAllErrors", () => {
  jest.spyOn(global.console, "error");
  test("should return true or false", () => {
    expect(isValidOrLogAllErrors(Number, String)(true)).toBe(false);

    expect(isValidOrLogAllErrors(Boolean, true)(true)).toBe(true);
  });
  test("should log 2 errors", () => {
    isValidOrLogAllErrors(Number, Boolean, String)(true);
    expect(global.console.error).toHaveBeenCalledTimes(2);
  });
  test("should log meaningful errors", () => {
    global.console.error = jest.fn();
    isValidOrLogAllErrors(Number, Boolean, String)(true);

    expect(global.console.error).toHaveBeenCalledWith(
      new TypeError("value true do not match type Number")
    );
    expect(global.console.error).toHaveBeenCalledWith(
      new TypeError("value true do not match type String")
    );
  });
  test("should log meaningful errors in schemas", () => {
    jest.spyOn(global.console, "error");
    isValidOrLogAllErrors(
      { x: Number },
      { y: Boolean },
      { z: String }
    )({ x: 1, y: 2, z: 3 });

    expect(global.console.error).toHaveBeenCalledWith(
      new TypeError("on path /y value 2 do not match type Boolean")
    );
    expect(global.console.error).toHaveBeenCalledWith(
      new TypeError("on path /z value 3 do not match type String")
    );
  });
});

```
