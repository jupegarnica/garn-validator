# Garn-validator

Runtime type validator for vanilla JS without dependencies

[![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator)

## Get started

```bash
npm install garn-validator

# or

yarn add garn-validator

```

### Use


```js
import check from 'garn-validator';

//check primitives with built in constructors
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

### Built in behaviors

There are 3 behaviors you can import

```js
export const isValid = setOnError(() => false);
export const isValidOrLog = setOnError((err) => console.error(err));
export const isValidOrThrow = setOnError(throwOnError);
export default isValidOrThrow;

```


## Roadmap
- [x] check value by constructor
- [x] enum type (oneOf & oneOfType)
- [x] shape type
- [x] custom type validation with a function (value, rootValue)
- [x] Check RegEx
- [x] Match object key by RegEx
- [x] setting to change behavior (throw error , log error or custom log)
- [ ] arrayOf & objectOf examples



## All it can do

```jsx
import check, { setOnError, isValidOrLog } from "./index";


describe("check strings", () => {
  test("check with constructor", () => {
    expect(() => {
      check(String)("a string");
    }).not.toThrow();

    expect(() => {
      check(String)("");
    }).not.toThrow();

    expect(() => {
      check(String)("");
    }).not.toThrow();

    expect(() => {
      check(String)(``);
    }).not.toThrow();

    expect(() => {
      check(Number)("a string");
    }).toThrow();
  });
  test("check with primitives", () => {
    expect(() => {
      check("a string")("a string");
    }).not.toThrow();

    expect(() => {
      check("a string")("a string");
    }).not.toThrow();

    expect(() => {
      check("not")("a string");
    }).toThrow();
  });
  test("check with Regex", () => {
    expect(() => {
      check(/string/)("a string");
    }).not.toThrow();

    expect(() => {
      check(/(string)$/)("a string");
    }).not.toThrow();

    expect(() => {
      check(/^(string)/)("a string");
    }).toThrow();
  });
  test("check with custom validator", () => {
    expect(() => {
      check((val) => val.length === 8)("a string");
    }).not.toThrow();

    expect(() => {
      check((val) => val.includes("str"))("a string");
    }).not.toThrow();
  });
});

describe("check numbers", () => {
  test("check with constructor", () => {
    expect(() => {
      check(String)(33);
    }).toThrow();

    expect(() => {
      check(Number)(33);
    }).not.toThrow();
    expect(() => {
      check(Number)(NaN);
    }).not.toThrow();
    expect(() => {
      check(Number)(Infinity);
    }).not.toThrow();
    expect(() => {
      check(Number.isNaN)(NaN);
    }).not.toThrow();
    expect(() => {
      check(Number.isNaN)(1);
    }).toThrow();
  });
  test("check with custom validator", () => {
    expect(() => {
      check((val) => val > 0)(33);
    }).not.toThrow();

    expect(() => {
      check((val) => val < 0)(33);
    }).toThrow();
  });
});
describe("check with custom validator", ()=> {
  test('can return true or false ', () => {
    expect(() => {
      check(() => true)(33);
    }).not.toThrow();
    expect(() => {
      check(() => false)(33);
    }).toThrow();
  });
  test("can throw a custom error", () => {
    expect(() => {
      check(() => {throw 'ups'})(33);
    }).toThrow('ups');

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


})
describe("check with enums", () => {
  test("optional", () => {
    expect(() => {
      check([undefined, 0])(undefined);
    }).not.toThrow();
    expect(() => {
      check([undefined, 0])(0);
    }).not.toThrow();
    expect(() => {
      check([undefined, 0])(null);
    }).toThrow();
  });
  test("constructors", () => {
    expect(() => {
      check([String, Number])("12");
    }).not.toThrow();
    expect(() => {
      check([String, Number])(12);
    }).not.toThrow();
    expect(() => {
      check([String, Number])(true);
    }).toThrow();
  });
});

describe("check objects", () => {
  const value = {
    a: 1,
    b: 2,
  };
  test("check with constructor", () => {
    expect(() => {
      check({ a: Number })(value); // not throw, all ok
    }).not.toThrow();

    expect(() => {
      check({ a: Number, c: Number })(value);
    }).toThrow();
    expect(() => {
      check({ a: Number, c: undefined })(value);
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

  test("check with primitives", () => {
    expect(() => {
      check({ a: 2 })(value);
    }).toThrow();
    expect(() => {
      check({ a: 1 })(value);
    }).not.toThrow();
  });
  test("check with custom function", () => {
    expect(() => {
      check({ a: (val) => val < 0 })(value);
    }).toThrow();
    expect(() => {
      check({ a: (val) => val > 0 })(value);
    }).not.toThrow();
  });
  test("check with custom function", () => {
    let obj = { x: "x", y: "x" };
    expect(() => {
      check({ x: (val, rootObject) => rootObject.y === val })(obj);
    }).not.toThrow();

    expect(() => {
      check({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: -1,
      });
    }).not.toThrow();
    expect(() => {
      check({
        max: (val, rootObject) => val > rootObject.min,
        min: (val, rootObject) => val < rootObject.max,
      })({
        max: 1,
        min: 10,
      });
    }).toThrow();

    expect(() => {
      check({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "y",
      });
    }).not.toThrow();
    expect(() => {
      check({
        "/./": (val, _, keyName) => keyName === val,
      })({
        x: "x",
        y: "x",
      });
    }).toThrow();
  });
  test("match key with regex", () => {
    expect(() => {
      check({ [/[a-z]/]: Number })(value);
    }).not.toThrow();
    expect(() => {
      check({ [/[a-z]/]: 0 })(value);
    }).toThrow();
    expect(() => {
      // only throws if the key is matched
      check({ [/[A-Z]/]: Number })(value);
    }).not.toThrow();
    expect(() => {
      check({ [/[a-z]/]: Number, a: 1 })(value); // not throw, all lowercase keys are numbers
    }).not.toThrow();
    expect(() => {
      check({ [/[a-z]/]: Number, a: 2 })(value); // will throw (a is not 2)
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

    expect(() => {
      isValidNumber("2");
    }).toThrow();
  });
  test("isPositive", () => {
    const isPositive = check((v) => v > 0);
    expect(() => {
      isPositive(2);
    }).not.toThrow();

    expect(() => {
      isPositive(-1);
    }).toThrow();
  });
});

describe("set on error to isValid", () => {
  const isValid = setOnError(() => false);

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
  const checkOrLog = setOnError((err) => console.error(err));

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