# garn-validator

Runtime type validator for vanilla JS without dependencies

<!-- [![npm version](https://badge.fury.io/js/garn-validator.svg)](https://www.npmjs.com/package/garn-validator) -->

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

## Roadmap
- [x] check value by constructor
- [x] enum type (oneOf & oneOfType)
- [x] shape type
- [x] custom prop validation with a function (value, propName, allProps)
- [x] Check RegEx
- [x] Match object key by RegEx
- [x] arrayOf & objectOf examples
- [ ] global and local settings to change how to warn invalid prop (throw error , log error or custom log)



## All it can do

```jsx
import check from "./index";

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
      check({ [/[a-z]/]: Number, a:1 })(value); // not throw, all lowercase keys are numbers
    }).not.toThrow();
    expect(() => {
      check({ [/[a-z]/]: Number, a: 2 })(value); // will throw (a is not 2)
    }).toThrow();
  });
});

describe("check falsy", () => {
  test("check", () => {
    expect(() => {
      check(null)(null);
    }).not.toThrow();

    expect(() => {
      check(null)("null");
    }).toThrow();

    expect(() => {
      check(undefined)(undefined);
    }).not.toThrow();

    expect(() => {
      check(undefined)("undefined");
    }).toThrow();
  });
});

```