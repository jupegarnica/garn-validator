# Garn-validator

Ultra fast runtime type validator for vanilla JS without dependencies.

[![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)

# Features

- Ultra light and **fast**: 3kB unzip (1.5 gzipped) with **0 dependencies**
- Support for checking primitives values and objects with schemas
- Easy to use and simple to learn but powerful
- Custom behaviors (4 built-in: isValid, isValidOrThrow  isValidOrLog and hasErrors)
- Works with ESModules or CommonJS from node 8.x to latests

# Get started

## Install

```bash
npm install garn-validator
# or yarn add garn-validator
```

#### Import with ES Modules

```js
import isValidOrThrow from "garn-validator"; // default export is isValidOrThrow
// or use named exports
import { isValidOrThrow } from "garn-validator";
```

#### Require with CommonJs

```js
const { isValidOrThrow } = require("garn-validator/commonjs");
// or use de default export
const isValidOrThrow = require("garn-validator/commonjs").default;
```

### Basic Use

```js
import is from "garn-validator"; // default export is isValidOrThrow

//check primitives against built-in constructors
is(Number) (2); // doesn't throws, all ok
is(String) (2); // will throw

// check against regex
is(/a*/) ("a"); // doesn't throws, all ok
is(/a/) ("b"); // will throw

// check against primitive
is("a") ("a"); // doesn't throws, all ok
is(true) (false); // will throw

// check against custom function
is((value) => value > 0) (33); // doesn't throws, all ok
is((value) => value > 0) (-1); // wil throw
is(Number.isNaN) (NaN); // doesn't throws, all ok

// check against enums (OR operator)
is(["a", "b"]) ("a"); // doesn't throws, all ok
is(["a", "b"]) ("c"); // will throw
is([Number, String]) ("18"); // doesn't throws
is([null, undefined, false, (value) => value < 0]) (18); // will throw

// check multiple validations (AND operator)
is(Array, (val) => val.length > 1) ([1, 2]); // doesn't throws
is(Array, (val) => val.includes(0)) ([1, 2]); // will throw

// check objects
const schema = { a: Number, b: Number }; // a and b are required
const obj = { a: 1, b: 2 };
is(schema) (obj); // doesn't throws, all ok

is({ a: 1 }) (obj); // doesn't throws, all keys on the schema are valid
is({ c: 1 }) (obj); // will throw (c is missing)

// check all keys that matches regex
is({ [/[a-z]/]: Number }) ({
  x: 1,
  y: 2,
  z: 3,
  CONSTANT: "foo",
}); // doesn't throws, all lowercase keys are numbers

// optional keys
is({ x$: Number }) ({ x: 1 }); // doesn't throws, x is present and is Number
is({ x$: String }) ({ x: 1 }); // will throw, x is present but is not String
is({ x$: String }) ({}); // doesn't throws, x is undefined

// you can use key$ or 'key?',
// it would be nicer to have key? without quotes but is not valid JS

is({ "x?": String }) ({}); // doesn't throws
```

### Composable

```js
// Simple example
const isPositive = is( v => v > 0 );
const isNotBig = is( v => v < 100 );

isPositive(-2); // will throw

is(isPositive,isNotBig) (200); // will throw


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
  country:['ES','UK']
});

isValidUser({
  name: "garn",
  age: 38,
  password: "12345aA-",
  country: 'ES'
}); // ok

isValidUser({
  name: "garn",
  age: 38,
  password: "1234", // incorrect
  country: 'ES'
}); // will throw
```


### Behaviors

There are 5 behaviors you can import:

- `isValidOrThrow` (returns true of throw on first error)
- `hasErrors` (return null or array of errors, never throws)
- `isValid` (returns true or false, never throws)
- `isValidOrLog` (returns true or false and log first error, never throws)
- `isValidOrLogAllErrors`  (returns true or false and log all errors, never throws)
- `isValidOrThrowAllErrors` (returns true or throw [AggregateError](https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/AggregateError) with all errors found)
``
The default export is `isValidOrThrow`

Learn more at [errors.test.js](https://github.com/jupegarnica/garn-validator/blob/master/tests/errors.test.js)

```js
import { isValid } from "garn-validator";

// stops in first Error
isValid(/[a-z]/) ("g"); // returns true
isValid(/[a-z]/) ("G"); // returns false, doesn't throws
```

```js
import { isValidOrLog } from "garn-validator";

// stops in first Error
isValidOrLog(/[a-z]/) ("g"); // do nothing (but also returns true)
isValidOrLog(/[a-z]/) ("G"); // logs error and return false

```

```js
import { hasErrors } from "garn-validator";

// return null or array or errors
// checks until the end
hasErrors(/[a-z]/) ("g"); // null
hasErrors(/[a-z]/, Number) ("G"); // [TypeError, TypeError]

```
## Especial cases

### AsyncFunction & GeneratorFunction

`AsyncFunction` and `GeneratorFunction` constructors are not in the global scope of any of the 3 JS environments (node, browser or node). If you need to check an async function or a generator you con import them from garn-validator.

>  Note:  Async functions and generators are not normal function, so it will fail against Function constructor

```js

import is , {AsyncFunction,GeneratorFunction } from 'garn-validator';

is (AsyncFunction) (async ()=>{}) ; // true
is (GeneratorFunction) (function*(){}) ; // true

is (Function) (function*(){}) ; // throws
is (Function) (async function(){}) ; // throws

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
import isValidOrThrow, { isValid } from "garn-validator";
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
  describe.skip("special cases", () => {
    test("required keys are more important than optional", () => {
      expect(
        isValidOrThrow({
          a: String,
          a$: Number,
        })({
          a: '2',
        })
      ).toBe(true);
    });
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
} from "garn-validator";

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
    }).toThrow('value 33 do not match type {"a":"Number"}');
  });
  test("should format the value", () => {
    expect(() => {
      isValidOrThrow({ a: Number })({ b: 33 });
    }).toThrow('value {"b":33} do not match type {"a":"Number"}');
  });
});

describe("check errors in serie", () => {
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      isValidOrThrow(Number, String)(2);
    }).toThrow('value 2 do not match type "String"');
  });
  test("should throw the error message related to the check failed", () => {
    expect(() => {
      isValidOrThrow(() => {
        throw new Error();
      }, String)(2);
    }).toThrow(Error);
  });
  test("should check only until the first check fails", () => {
    global.console = {
      log: jest.fn(),
    };
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

describe("hasErrors", () => {
  test("should return null", () => {
    expect(
      hasErrors({ num: Number, str: String })({ num: 2, str: "str" })
    ).toBe(null);
  });
  test("should return array of errors", () => {
    expect(
      hasErrors({ num: Number, str: String })( { num: "2", str: "str" })
    ).toEqual([
      new TypeError('on path /num value "2" do not match type "Number"'),
    ]);
  });
  describe("in serie", () => {
    test.each([
      [Number, (v) => v > 0, 2, null],
      [
        Number,
        (v) => v > 100,
        2,
        [new TypeError('value 2 do not match type "v=>v>100"')],
      ],
      [
        String,
        (v) => v > 100,
        2,
        [
          new TypeError('value 2 do not match type "String"'),
          new TypeError('value 2 do not match type "v=>v>100"'),
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
        [new TypeError('on path /num value "2" do not match type "Number"')],
      ],
      [
        { num: Number, str: String },
        { num: "2", str: null },
        [
          new TypeError('on path /num value "2" do not match type "Number"'),
          new TypeError('on path /str value null do not match type "String"'),
        ],
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
        [
          new TypeError(
            'on path /obj/num value "2" do not match type "Number"'
          ),
        ],
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
          new TypeError(
            'on path /obj/num value "2" do not match type "Number"'
          ),
          new TypeError(
            'on path /obj/str value null do not match type "String"'
          ),
        ],
      ],
    ])(
      "should return array of errors hasErrors(%p)(%p) === %p",
      (schema, obj, expected) => {
        expect(hasErrors(schema)(obj)).toStrictEqual(expected);
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
          'on path /noValidKey value 1 do not match type "()=>false"'
        ),
        new TypeError(
          'on path /name value "Garn" do not match type "/^[a-z]{3,}$/"'
        ),
        new TypeError('on path /age value 18 do not match type "age=>age>18"'),
        new EvalError("unexpected key"),
        new TypeError(
          'on path /car/brand value "Honda" do not match type ["honda","toyota"]'
        ),
        new TypeError(
          'on path /car/date value "1982-01-01" do not match type "Date"'
        ),
        new TypeError(
          'on path /car/country/name value undefined do not match type "String"'
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
        y: 1
      }
      expect(hasErrors(schema1,schema2)(obj)).toEqual([
        new TypeError(
          'on path /x value true do not match type "Number"'
        ),
        new TypeError(
          'on path /y value 1 do not match type "Boolean"'
        ),
        new TypeError(
          'on path /z value undefined do not match type "Function"'
        ),

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
      // error.errors.forEach(e => console.warn(e.name, e.message))
    }
  });
});
describe("isValidOrLogAllErrors", () => {
  test("should return true or false", () => {
    expect(isValidOrLogAllErrors(Number, String)(true)).toBe(false);

    expect(isValidOrLogAllErrors(Boolean, true)(true)).toBe(true);
  });
  test("should log 2 errors", () => {
    global.console.error = jest.fn();
    isValidOrLogAllErrors(Number, Boolean, String)(true);
    expect(global.console.error).toHaveBeenCalledTimes(2);
  });
  test("should log meaningful errors", () => {
    global.console.error = jest.fn();
    isValidOrLogAllErrors(Number, Boolean, String)(true);

    expect(global.console.error).toHaveBeenCalledWith(
      'value true do not match type "Number"'
    );
    expect(global.console.error).toHaveBeenCalledWith(
      'value true do not match type "String"'
    );
  });
  test("should log meaningful errors in schemas", () => {
    global.console.error = jest.fn();
    isValidOrLogAllErrors(
      { x: Number },
      { y: Boolean },
      { z: String }
    )({ x: 1, y: 2, z: 3 });

    expect(global.console.error).toHaveBeenCalledWith(
      "on path /y value 2 do not match type \"Boolean\""

    );
    expect(global.console.error).toHaveBeenCalledWith(
      "on path /y value 2 do not match type \"Boolean\""
    );
  });
});

```
