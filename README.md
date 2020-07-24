# Garn-validator

Ultra fast runtime type validator for vanilla JS without dependencies.

[![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)

# Features

- Ultra light and fast: 3kB unzip & none dependencies
- Support for checking primitives values and objects with schemas
- Easy to use and simple to learn
- Custom behaviors (3 built-in: isValid, isValidOrThrow & isValidOrLog)
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
import isValidOrThrow from 'garn-validator'; // default export is isValidOrThrow
// or use named exports
import { isValidOrLog } from 'garn-validator';

```

#### Require with CommonJs

```js

const { isValidOrThrow } = require('garn-validator/commonjs');
// or use de default export
const isValidOrThrow = require('garn-validator/commonjs').default;

```

### Basic Use

```js
import check from 'garn-validator'; // default export is isValidOrThrow

//check primitives with built-in constructors
check(Number)(2)  // not throw, all ok
check(String)(2)  // will throw


// check with regex
check(/[a-z]/)('a')  // not throw, all ok
check(/[A-Z]/)('a')  // will throw

// check with custom function
check(val => val > 0)(33)  // not throw, all ok
check(val => val > 0)(-1)  // wil throw
check(Number.isNaN)(NaN)  // not throw, all ok

// check objects
const obj = {
  a: 1,
  b: 2
}
const schema = { a:Number, b:Number }
check(schema)(obj)  // not throw, all ok

check({a:1})(obj)  // not throw, all keys on the schema are valid
check({c:1})(obj) // will throw (c is missing)

check({[/[a-z]/]:Number})({x:1,y:2,z:3, CONSTANT: 'foo'})  // not throw, all lowercase keys are numbers


```
### Composable

```js

const isValidNumber = check(Number)
isValidNumber(2);

const isPositive = check(v => v > 0);
isPositive(2)

```
### Custom behavior

```js
const isValidOrSendReport =  setOnError((err) => {
  fetch('//myReportServer.com/report', {
    method: 'POST',
    body: JSON.stringify(err),
    headers:{
      'Content-Type': 'application/json'
    }
  })
  throw new TypeError(err)
});

isValidOrSendReport(Number)('3') // will send error

```

### Built-in behaviors

There are 3 behaviors you can import

```js
export const isValid = setOnError(() => false);
export const isValidOrLog = setOnError((err) => console.error(err));
export const isValidOrThrow = setOnError(throwOnError);
export default isValidOrThrow;

```

```js
import { isValid } from 'garn-validator';

isValid(/[a-z]/)('g'); // returns true
isValid(/[a-z]/)('G'); // returns false, not throws

```

```js
import { isValidOrLog } from 'garn-validator';

isValidOrLog(/[a-z]/)('g'); // do nothing (but also returns true)
isValidOrLog(/[a-z]/)('G'); // logs error

```


## Roadmap

- [x] check value by constructor
- [x] enum type (oneOf & oneOfType)
- [x] shape type
- [x] custom type validation with a function (value, rootValue)
- [x] Check RegEx
- [x] Match object key by RegEx
- [x] setting to change behavior (throw error , log error or custom logic)
- [x] arrayOf & objectOf examples
- [X] multiples validations `isValid(String, val => val.length > 3, /^[a-z]+$/)('foo')`
- [ ] schema with optionals key `{ optionalKey?: Number }`
- [ ] setting for check all keys (no matter if it fails) and return (or throw) an array of errors
- [ ] Support for deno
- [ ] Support for browser


## All it can do
```js
import check, { setOnError, isValid } from "garn-validator";

describe("check with constructors", () => {
  test("should work", () => {
    expect(() => {
      check(String)("a string");
    }).not.toThrow();

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
      check(Object)({});
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
      check(2)(2);
    }).not.toThrow();

    expect(() => {
      check(1)(2);
    }).toThrow();
  });
});

describe("check with custom validator", () => {
  test("can return true or false", () => {
    expect(() => {
      check(() => true)(33);
    }).not.toThrow();

    expect(() => {
      check(() => false)(33);
    }).toThrow();
  });
  test("can throw a custom message", () => {
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
  test("can throw a custom type of error", () => {
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
      check({ x: (val, rootObject, keyName) => rootObject.y === val })({ x: "x", y: "x" });
    }).not.toThrow();

    expect(() => {
      check({
        max: (val, rootObject,keyName) => val > rootObject.min,
        min: (val, rootObject,keyName) => val < rootObject.max,
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
    test('should match all keys matching the regex', () => {
      expect(() => {
        check({ [/[a-z]/]: Number })({
          a: 1,
          b: 2,
        });
      }).not.toThrow();
    });

    test('should throw', () => {
      expect(() => {
        check({ [/[a-z]/]: 0 })({
          a: 1,
          b: 2,
        });
      }).toThrow();
    });

    test('should throw only if the key is matched', () => {
      expect(() => {
        check({ [/[A-Z]/]: Number })({
          a: 1,
          b: 2,
        });
      }).not.toThrow();
    });

  test('not throws, all lowercase keys are numbers', () => {
    expect(() => {
      check({ [/[a-z]/]: Number, a: 1 })({
        a: 1,
        b: 2,
      }); //
    }).not.toThrow();
  });

    test('should throw (a is not 2) ', () => {
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
    expect(isValid((val) => val > 0, Number, 2, val => val === 2)(2)).toBe(true);
  });

  test("should throw the error message related to the check failed", () => {
    expect(()=> {
      check(() => { throw new Error()}, String)(2)
    }).toThrow(Error)
  });

  test("should check only until the first check fails", () => {
    global.console = {
      log: jest.fn(),
    };
    try {
      check(() => { throw new Error()}, () => console.log('I run?'))(2)
    } catch (err) {

    }
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
  test("isValidNumber", () => {
    const isValidNumber = check(Number);

    expect(() => {
      isValidNumber(2);
    }).not.toThrow();
  });
  test("isPositive", () => {
    const isPositive = check((v) => v > 0);

    expect(() => {
      isPositive(2);
    }).not.toThrow();
  });
});

describe("set on error to isValid", () => {
  // const isValid = setOnError(() => false); // import named isValid

  test("should return true if valid", () => {
    expect(isValid(Number)(2)).toBe(true);
  });
  test("should return false if valid", () => {
    expect(isValid(String)(2)).toBe(false);
  });
});

describe("set on error  to log error", () => {
  beforeAll(() => {
    global.console = {
      error: jest.fn(),
      log: jest.fn(),
    };
  });
  const checkOrLog = setOnError((err) => console.error(err)); // same as isValidOrLog

  test("should not log error", () => {
    checkOrLog(Number)(2);

    expect(global.console.error).not.toHaveBeenCalled();
  });
  test("should log error", () => {
    checkOrLog(String)(2);

    expect(global.console.error).toHaveBeenCalled();
  });
});
```

### More examples

Watch folder [tests](https://github.com/jupegarnica/garn-validator/tree/master/tests) to learn more.

The most interesting test is [use.test.js](https://github.com/jupegarnica/garn-validator/blob/master/tests/use.test.js)