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

## Node.js

The library is tested in node 8.x to 14.x

### Install

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
import check from "garn-validator"; // default export is isValidOrThrow

//check primitives against built-in constructors
check(Number) (2); // doesn't throws, all ok
check(String) (2); // will throw

// check against regex
check(/a*/) ("a"); // doesn't throws, all ok
check(/a/) ("b"); // will throw

// check against primitive
check("a") ("a"); // doesn't throws, all ok
check(true) (false); // will throw

// check against custom function
check((value) => value > 0) (33); // doesn't throws, all ok
check((value) => value > 0) (-1); // wil throw
check(Number.isNaN) (NaN); // doesn't throws, all ok

// check against enums (OR operator)
check(["a", "b"]) ("a"); // doesn't throws, all ok
check(["a", "b"]) ("c"); // will throw
check([Number, String]) ("18"); // doesn't throws
check([null, undefined, false, (value) => value < 0]) (18); // will throw

// check multiple validations (AND operator)
check(Array.isArray, (val) => val.length > 1) ([1, 2]); // doesn't throws
check(Array.isArray, (val) => val.includes(0)) ([1, 2]); // will throw

// check objects
const schema = { a: Number, b: Number }; // a and b are required
const obj = { a: 1, b: 2 };
check(schema) (obj); // doesn't throws, all ok

check({ a: 1 }) (obj); // doesn't throws, all keys on the schema are valid
check({ c: 1 }) (obj); // will throw (c is missing)

// check all keys that matches regex
check({ [/[a-z]/]: Number }) ({
  x: 1,
  y: 2,
  z: 3,
  CONSTANT: "foo",
}); // doesn't throws, all lowercase keys are numbers

// optional keys
check({ x$: Number }) ({ x: 1 }); // doesn't throws, x is present and is Number
check({ x$: String }) ({ x: 1 }); // will throw, x is present but is not String
check({ x$: String }) ({}); // doesn't throws, x is undefined

// you can use key$ or 'key?',
// it would be nicer to have key? without quotes but is not valid JS

check({ "x?": String }) ({}); // doesn't throws
```

### Composable

```js
// Simple example
const isPositive = check( v => v > 0 );
const isNotBig = check( v => v < 100 );

isPositive(-2); // will throw

check(isPositive,isNotBig) (200); // will throw


// Real example
const isValidPassword = check(
  String,
  (str) => str.length >= 8,
  /[a-z]/,
  /[A-Z]/,
  /[0-9]/,
  /[-_/!"·$%&/()]/
);

const isValidName = check(String, (name) => name.length >= 3);
const isValidAge = check(
  Number,
  (age) => age > 18,
  (age) => age < 40
);

const isValidUser = check({
  name: isValidName,
  age: isValidAge,
  password: isValidPassword,
});

isValidUser({
  name: "garn",
  age: 38,
  password: "12345aA-",
}); // ok

isValidUser({
  name: "garn",
  age: 18,
  password: "1234",
}); // will throw
```


### Behaviors

There are 3 behaviors you can import

```js

export const isValid = setOnError(returnsFalse);
export const isValidOrLog = setOnError(logError);
export const isValidOrThrow = setOnError(throwOnError);
export default isValidOrThrow;
```

```js
import { isValid } from "garn-validator";

isValid(/[a-z]/) ("g"); // returns true
isValid(/[a-z]/) ("G"); // returns false, doesn't throws
```

```js
import { isValidOrLog } from "garn-validator";

isValidOrLog(/[a-z]/) ("g"); // do nothing (but also returns true)
isValidOrLog(/[a-z]/) ("G"); // logs error
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
- [ ] Setting for check all keys (no matter if it fails) and return (or throw) an array of errors
- [ ] Support for deno
- [ ] Support for browser

## All it can do

```js
import check, {
  setOnError, // returns new instance setting on error behavior
  isValid, // returns true or false
} from "garn-validator";

describe("check with constructors", () => {
  test("should work", () => {
    expect(() => {
      check(RegExp)(/\s/);
    }).not.toThrow();

    expect(() => {
      check(Array)([]);
    }).not.toThrow();

    expect(() => {
      check(RangeError)(new RangeError());
    }).not.toThrow();

    expect(() => {
      class MyClass {}
      check(MyClass)(new MyClass());
    }).not.toThrow();
  });
});
describe("check with primitives values", () => {
  test("should work", () => {
    expect(() => {
      check("a string")("a string");
    }).not.toThrow();

    expect(() => {
      check(1)(2);
    }).toThrow();
  });
});

describe("check with custom validator", () => {
  test("cyou can return true or false", () => {
    expect(() => {
      check(() => true)(33);
    }).not.toThrow();

    expect(() => {
      check(() => false)(33);
    }).toThrow();
  });
  test("you can throw a custom message", () => {
    expect(() => {
      check(() => {
        throw "ups";
      })(33);
    }).toThrow("ups");
  });
  test("by default throws TypeError", () => {
    expect(() => {
      check(Boolean)(33);
    }).toThrow(TypeError);
  });
  test("you can throw a custom type of error", () => {
    expect(() => {
      check((v) => {
        if (v > 10) throw new RangeError("ups");
      })(33);
    }).toThrow(RangeError);
  });
});
describe("check with enums", () => {
  test("Should be used as OR operator", () => {
    expect(() => {
      check([1, 0])(1);
    }).not.toThrow();

    expect(() => {
      check([Number, String])(0);
    }).not.toThrow();

    expect(() => {
      check([undefined, 0])(null);
    }).toThrow();
  });
});

describe("check objects against a schema", () => {
  test("check with constructor", () => {
    expect(() => {
      check({ a: Number })({
        a: 1,
        b: 2,
      }); // not throw, all ok
    }).not.toThrow();

    expect(() => {
      check({ a: Number, c: Number })({
        a: 1,
        b: 2,
      });
    }).toThrow();

    expect(() => {
      check({ a: Number, c: undefined })({
        a: 1,
        b: 2,
      });
    }).not.toThrow();
  });
  test("keys on the schema are required", () => {
    expect(() => {
      check({ a: 1 })({ a: 1, b: 2 });
    }).not.toThrow();

    expect(() => {
      check({ c: 1 })({ a: 1, b: 2 });
    }).toThrow();
  });

  test("check with custom function", () => {
    expect(() => {
      check({ a: (val) => val < 0 })({
        a: 1,
      });
    }).toThrow();
  });
  test("check with custom function against the root object", () => {
    expect(() => {
      check({ x: (val, rootObject, keyName) => rootObject.y === val })({
        x: "x",
        y: "x",
      });
    }).not.toThrow();

    expect(() => {
      check({
        max: (val, rootObject, keyName) => val > rootObject.min,
        min: (val, rootObject, keyName) => val < rootObject.max,
      })({
        max: 1,
        min: -1,
      });
    }).not.toThrow();

    expect(() => {
      check({
        "/./": (val, root, keyName) => keyName === val,
      })({
        x: "x",
        y: "y",
      });
    }).not.toThrow();

    expect(() => {
      check({
        "/./": (val, root, keyName) => keyName === val,
      })({
        x: "x",
        y: "x",
      });
    }).toThrow();
  });
  describe("match key with regex", () => {
    test("should match all keys matching the regex", () => {
      expect(() => {
        check({ [/[a-z]/]: Number })({
          a: 1,
          b: 2,
        });
      }).not.toThrow();
    });

    test("should throw", () => {
      expect(() => {
        check({ [/[a-z]/]: 0 })({
          a: 1,
          b: 2,
        });
      }).toThrow();
    });

    test("should throw only if the key is matched", () => {
      expect(() => {
        check({ [/[A-Z]/]: Number })({
          a: 1,
          b: 2,
        });
      }).not.toThrow();
    });

    test("not throws, all lowercase keys are numbers", () => {
      expect(() => {
        check({ [/[a-z]/]: Number, a: 1 })({
          a: 1,
          b: 2,
        }); //
      }).not.toThrow();
    });

    test("should throw (a is not 2) ", () => {
      expect(() => {
        check({ [/[a-z]/]: Number, a: 2 })({
          a: 1,
          b: 2,
        });
      }).toThrow();
    });
  });
});

describe("multiple validations in series", () => {
  test("should pass every validation as an AND operator", () => {
    expect(isValid(Number, String)(2)).toBe(false);
  });
  test("should pass every validation not matter how many", () => {
    expect(
      isValid(
        (val) => val > 0,
        Number,
        2,
        (val) => val === 2
      )(2)
    ).toBe(true);
  });

  test("should throw the error message related to the check failed", () => {
    expect(() => {
      check(() => {
        throw new Error();
      }, String)(2);
    }).toThrow(Error);
  });

  test("should check only until the first check fails", () => {
    global.console = {
      log: jest.fn(),
    };
    try {
      check(
        () => {
          throw new Error();
        },
        () => console.log("I run?")
      )(2);
    } catch (err) {}
    expect(global.console.log).not.toHaveBeenCalled();
  });
});

describe("ArrayOf and objectOf", () => {
  test("ArrayOf", () => {
    expect(() => {
      check({ [/\d/]: Number })([1, 2]);
    }).not.toThrow();
  });
  test("objectOf", () => {
    expect(() => {
      check({ [/\w/]: Number })({ a: 1 });
    }).not.toThrow();
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
  test("check big object", () => {
    expect(() => {
      check(schema)(obj); // not throw, all ok
    }).not.toThrow();
  });
});

describe("composable", () => {
  test("with complex schema", () => {
    const isValidPassword = check(
      String,
      (str) => str.length >= 8,
      /[a-z]/,
      /[A-Z]/,
      /[0-9]/,
      /[-_/!"·$%&/()]/
    );
    const isValidName = check(String, (name) => name.length >= 3);
    const isValidAge = check(
      Number,
      (age) => age > 18,
      (age) => age < 40
    );

    const validUser = check({
      name: isValidName,
      age: isValidAge,
      password: isValidPassword,
    });

    expect(() => {
      validUser({
        name: "garn",
        age: 38,
        password: "12345aA-",
      });
    }).not.toThrow();
    expect(() => {
      validUser({
        name: "garn",
        age: 38,
        password: "1234",
      });
    }).toThrow();
  });
});

// describe("set on error to isValid", () => {
//   const isValid = setOnError(() => false); // import named isValid

//   test("should return true if valid", () => {
//     expect(isValid(Number)(2)).toBe(true);
//   });
//   test("should return false if valid", () => {
//     expect(isValid(String)(2)).toBe(false);
//   });
// });

// describe("set on error  to log error", () => {
//   beforeAll(() => {
//     global.console = {
//       error: jest.fn(),
//       log: jest.fn(),
//     };
//   });
//   const checkOrLog = setOnError((err) => console.error(err)); // same as isValidOrLog

//   test("should not log error", () => {
//     checkOrLog(Number)(2);

//     expect(global.console.error).not.toHaveBeenCalled();
//   });
//   test("should log error", () => {
//     checkOrLog(String)(2);

//     expect(global.console.error).toHaveBeenCalled();
//   });
// });
```

### More examples

Watch folder [tests](https://github.com/jupegarnica/garn-validator/tree/master/tests) to learn more.

The most interesting test is [use.test.js](https://github.com/jupegarnica/garn-validator/blob/master/tests/use.test.js)
